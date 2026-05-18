module.exports = async (req, res) => {

  // ==============================
  // TARGET WEBSITE
  // ==============================
  const shopifyDomain = "applyjobs247.onlinejobhelp.com";
  const proxyHost = req.headers.host;

  const targetURL = `https://${shopifyDomain}${req.url}`;

  try {

    // ==============================
    // REQUEST BODY
    // ==============================
    let bodyBuffer = null;

    if (req.method !== "GET" && req.method !== "HEAD") {

      bodyBuffer = await new Promise((resolve, reject) => {

        const chunks = [];

        req.on("data", (chunk) => chunks.push(chunk));

        req.on("end", () => resolve(Buffer.concat(chunks)));

        req.on("error", reject);

      });

    }

    // ==============================
    // FETCH WEBSITE
    // ==============================
    const response = await fetch(targetURL, {

      method: req.method,

      headers: {
        ...req.headers,
        host: shopifyDomain,
        "X-Forwarded-Host": proxyHost,
        "X-Forwarded-Proto": "https",
      },

      body: bodyBuffer || null,

      redirect: "manual",

    });

    // ==============================
    // HANDLE REDIRECTS
    // ==============================
    if (
      response.status >= 300 &&
      response.status < 400
    ) {

      let location =
        response.headers.get("location") || "";

      if (location.includes(shopifyDomain)) {

        location = location
          .replace(
            `https://${shopifyDomain}`,
            `https://${proxyHost}`
          )
          .replace(
            `http://${shopifyDomain}`,
            `https://${proxyHost}`
          );

      }

      res.setHeader("location", location);

      return res.status(response.status).end();

    }

    // ==============================
    // COPY HEADERS
    // ==============================
    const skipHeaders = [
      "content-encoding",
      "transfer-encoding",
      "content-length",
    ];

    response.headers.forEach((value, key) => {

      if (skipHeaders.includes(key)) return;

      // Remove original cookie domain
      if (key === "set-cookie") {
        value = value.replace(
          /Domain=[^;]+;?/gi,
          ""
        );
      }

      res.setHeader(key, value);

    });

    const contentType =
      response.headers.get("content-type") || "";

    // ==============================
    // DOMAIN REWRITE
    // ==============================
    const rewriteText = (body) =>
      body
        .replace(
          /applyjobs247\.onlinejobhelp\.com/gi,
          proxyHost
        )
        .replaceAll(
          `https://${shopifyDomain}`,
          `https://${proxyHost}`
        )
        .replaceAll(
          `http://${shopifyDomain}`,
          `https://${proxyHost}`
        );

    // =========================================================
    // HTML PROCESSING
    // =========================================================
    if (contentType.includes("text/html")) {

      let body = rewriteText(
        await response.text()
      );

      // =====================================================
      // REMOVE DISCLAIMER CONTENT
      // =====================================================
      body = body.replace(
        /DISCLAIMER[\s\S]*?jobpostingcustomercare@gmail\.com\.?/gi,
        ""
      );

      body = body.replace(
        /Welcome to Freedeals\.onlinejob247\.com\.com[\s\S]*?job search\./gi,
        ""
      );

      body = body.replace(
        /For any inquiries or to raise a complaint[\s\S]*?gmail\.com\.?/gi,
        ""
      );

      body = body.replace(
        /<[^>]*(disclaimer|warning|notice)[^>]*>[\s\S]*?<\/[^>]+>/gi,
        ""
      );

      // =====================================================
      // MODERN SAFE UI DESIGN
      // =====================================================
      const customCSS = `
<style>

/* ============================= */
/* GLOBAL */
/* ============================= */

body{
  background:#f5f7fb !important;
}

/* ============================= */
/* TOP BAR */
/* ============================= */

.custom-topbar{
  background:linear-gradient(
    90deg,
    #2563eb,
    #1d4ed8
  );

  color:white;
  text-align:center;
  padding:12px 15px;
  font-size:14px;
  font-weight:600;
}

/* ============================= */
/* CARDS */
/* ============================= */

.card,
.job-card,
.product-card{

  border-radius:16px !important;

  box-shadow:
    0 4px 14px rgba(0,0,0,.08) !important;

  transition:.25s ease !important;

  overflow:hidden !important;
}

.card:hover,
.job-card:hover{
  transform:translateY(-3px);
}

/* ============================= */
/* BUTTONS */
/* ============================= */

.btn,
button,
input[type="submit"]{

  border-radius:10px !important;

  transition:.2s ease !important;
}

.btn:hover,
button:hover{
  opacity:.92;
}

/* ============================= */
/* SEARCH BAR */
/* ============================= */

input[type="text"],
input[type="search"]{

  border-radius:12px !important;

  border:1px solid #dbe2ea !important;

  padding:12px !important;
}

/* ============================= */
/* JOB TITLES */
/* ============================= */

h1,h2,h3{
  color:#111827 !important;
}

/* ============================= */
/* LINKS */
/* ============================= */

a{
  transition:.2s ease;
}

a:hover{
  opacity:.85;
}

/* ============================= */
/* HIDE SHOPIFY BRANDING */
/* ============================= */

a[href*="shopify"]{
  display:none !important;
}

/* ============================= */
/* REMOVE NOTICE BANNERS */
/* ============================= */

.disclaimer,
.notice,
.warning{
  display:none !important;
}

/* ============================= */
/* MOBILE FIXES */
/* ============================= */

img,
svg{
  max-width:100% !important;
  height:auto !important;
}

/* Prevent giant icons */
svg{
  width:auto !important;
  height:auto !important;
}

/* ============================= */
/* FOOTER */
/* ============================= */

footer{
  margin-top:40px !important;
}

</style>
`;

      // =====================================================
      // CUSTOM TOP BAR
      // =====================================================
      const topBar = `
<div class="custom-topbar">
🔥 Find Latest Remote Jobs & Internships Updated Daily
</div>
`;

      // Inject CSS
      body = body.replace(
        "</head>",
        `${customCSS}</head>`
      );

      // Inject top bar
      body = body.replace(
        "<body>",
        `<body>${topBar}`
      );

      // =====================================================
      // GOOGLE VERIFICATION
      // =====================================================
      body = body.replace(
        "<head>",
        `<head>
<meta
name="google-site-verification"
content="oOB4GFrNSNdykfLPFYsy8byFMtrbAiccGJfrX7_UcOU"
/>
`
      );

      // =====================================================
      // UPDATE JOB SCHEMA DATES
      // =====================================================
      body = body.replace(
        /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
        (match, json) => {

          try {

            const schema = JSON.parse(json);

            const update = (obj) => {

              if (!obj || typeof obj !== "object") {
                return obj;
              }

              if (Array.isArray(obj)) {
                return obj.map(update);
              }

              if (obj["@type"] === "JobPosting") {

                obj["datePosted"] =
                  "2026-05-18";

                obj["validThrough"] =
                  "2026-12-31";
              }

              Object.keys(obj).forEach((k) => {
                obj[k] = update(obj[k]);
              });

              return obj;
            };

            return `
<script type="application/ld+json">
${JSON.stringify(update(schema))}
</script>
`;

          } catch {

            return match;

          }

        }
      );

      res.setHeader(
        "content-type",
        "text/html; charset=utf-8"
      );

      return res
        .status(response.status)
        .send(body);

    }

    // =========================================================
    // CSS / JS / XML
    // =========================================================
    if (
      contentType.includes("text/css") ||
      contentType.includes("javascript") ||
      contentType.includes("xml")
    ) {

      const body = rewriteText(
        await response.text()
      );

      return res
        .status(response.status)
        .send(body);

    }

    // =========================================================
    // BINARY FILES
    // =========================================================
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
