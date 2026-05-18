module.exports = async (req, res) => {

  const shopifyDomain = "applyjobs247.onlinejobhelp.com";
  const proxyHost = req.headers.host;

  const targetURL = `https://${shopifyDomain}${req.url}`;

  try {

    let bodyBuffer = null;

    if (req.method !== "GET" && req.method !== "HEAD") {

      bodyBuffer = await new Promise((resolve, reject) => {

        const chunks = [];

        req.on("data", (chunk) => chunks.push(chunk));

        req.on("end", () => resolve(Buffer.concat(chunks)));

        req.on("error", reject);

      });

    }

    const response = await fetch(targetURL, {
      method: req.method,

      headers: {
        ...req.headers,
        host: shopifyDomain,
      },

      body: bodyBuffer || null,
    });

    const contentType =
      response.headers.get("content-type") || "";

    const rewriteText = (body) =>
      body
        .replace(
          /applyjobs247\.onlinejobhelp\.com/gi,
          proxyHost
        )
        .replaceAll(
          `https://${shopifyDomain}`,
          `https://${proxyHost}`
        );

    // ===== HTML =====
    if (contentType.includes("text/html")) {

      let body = rewriteText(
        await response.text()
      );

      // Remove disclaimer
      body = body.replace(
        /Disclaimer:.*?<\/p>/gis,
        ""
      );

      // Custom design
      const customCSS = `
      <style>

      body{
        background:#f4f7fb !important;
        font-family:Arial,sans-serif !important;
      }

      header{
        background:#111827 !important;
      }

      button{
        background:#2563eb !important;
        color:white !important;
        border:none !important;
        padding:10px 18px !important;
        border-radius:8px !important;
      }

      .card,.job-card{
        border-radius:16px !important;
        box-shadow:0 4px 20px rgba(0,0,0,.08) !important;
      }

      </style>
      `;

      body = body.replace(
        "</head>",
        `${customCSS}</head>`
      );

      res.setHeader(
        "content-type",
        "text/html; charset=utf-8"
      );

      return res.status(200).send(body);
    }

    // ===== CSS / JS / XML =====
    if (
      contentType.includes("text/css") ||
      contentType.includes("javascript") ||
      contentType.includes("xml")
    ) {

      const body = rewriteText(
        await response.text()
      );

      return res.status(200).send(body);
    }

    // ===== BINARY =====
    const buffer = await response.arrayBuffer();

    return res
      .status(response.status)
      .send(Buffer.from(buffer));

  } catch (error) {

    return res.status(500).send(
      "Proxy Error: " + error.message
    );

  }

};
