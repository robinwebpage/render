```js
module.exports = async (req, res) => {
  // ===== TARGET WEBSITE =====
  const shopifyDomain = "applyjobs247.onlinejobhelp.com";
  const proxyHost = req.headers.host;

  const targetURL = `https://${shopifyDomain}${req.url}`;

  try {
    // ===== REQUEST BODY =====
    let bodyBuffer = null;

    if (req.method !== "GET" && req.method !== "HEAD") {
      bodyBuffer = await new Promise((resolve, reject) => {
        const chunks = [];

        req.on("data", (chunk) => chunks.push(chunk));
        req.on("end", () => resolve(Buffer.concat(chunks)));
        req.on("error", reject);
      });
    }

    let fetchURL = targetURL;
    let response;
    let redirectCount = 0;

    // ===== HANDLE REDIRECTS =====
    while (redirectCount < 5) {
      response = await fetch(fetchURL, {
        method: req.method,

        headers: {
          ...req.headers,
          host: new URL(fetchURL).hostname,
          "X-Forwarded-Host": proxyHost,
          "X-Forwarded-Proto": "https",
        },

        body: bodyBuffer || null,
        redirect: "manual",
      });

      // ===== REDIRECT REWRITE =====
      if (response.status >= 300 && response.status < 400) {
        let location = response.headers.get("location") || "";

        // Replace original domain with proxy domain
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

          res.setHeader("location", location);
          res.status(response.status).end();
          return;
        }

        // Already rewritten
        if (location.includes(proxyHost)) {
          res.setHeader("location", location);
          res.status(response.status).end();
          return;
        }

        // Follow redirect
        fetchURL = location.startsWith("http")
          ? location
          : `https://${shopifyDomain}${location}`;

        redirectCount++;
        continue;
      }

      break;
    }

    // ===== COPY HEADERS =====
    const skipHeaders = [
      "content-encoding",
      "transfer-encoding",
      "content-length",
    ];

    response.headers.forEach((value, key) => {
      if (skipHeaders.includes(key)) return;

      // Remove original cookie domain
      if (key === "set-cookie") {
        value = value.replace(/Domain=[^;]+;?/gi, "");
      }

      res.setHeader(key, value);
    });

    const contentType =
      response.headers.get("content-type") || "";

    // ===== UNIVERSAL DOMAIN REWRITE =====
    const rewriteText = (body) =>
      body
        .replace(
          /applyjobs247\.onlinejobhelp\.com/gi,
          proxyHost
        )
        .split(`https://${shopifyDomain}`)
        .join(`https://${proxyHost}`)
        .split(`http://${shopifyDomain}`)
        .join(`https://${proxyHost}`);

    // =========================================================
    // HTML PROCESSING
    // =========================================================
    if (contentType.includes("text/html")) {
      let body = rewriteText(await response.text());

      // ===== REMOVE DISCLAIMERS =====
      body = body.replace(
        /This site is not affiliated with.*?<\/div>/gis,
        ""
      );

      body = body.replace(
        /Disclaimer:.*?<\/p>/gis,
        ""
      );

      body = body.replace(
        /<[^>]*(disclaimer|warning|notice)[^>]*>[\s\S]*?<\/[^>]+>/gi,
        ""
      );

      // ===== GOOGLE VERIFICATION =====
      body = body.replace(
        "<head>",
        `<head>
<meta name="google-site-verification" content="oOB4GFrNSNdykfLPFYsy8byFMtrbAiccGJfrX7_UcOU" />
`
      );

      // ===== CUSTOM DESIGN =====
      const customCSS = `
<style>

/* ===== GLOBAL ===== */

body{
  margin:0 !important;
  padding:0 !important;
  background:#f4f7fb !important;
  color:#222 !important;
  font-family:Arial,sans-serif !important;
}

/* ===== HEADER ===== */

header,
.header{
  background:#0f172a !important;
  padding:18px 30px !important;
  box-shadow:0 2px 10px rgba(0,0,0,.1);
}

/* ===== NAVIGATION ===== */

nav a{
  color:white !important;
  text-decoration:none !important;
  margin:0 12px !important;
  font-weight:600 !important;
}

/* ===== HERO ===== */

.hero,
.banner{
  background:linear-gradient(
    135deg,
    #2563eb,
    #1e40af
  ) !important;

  color:white !important;
  padding:80px 20px !important;
  text-align:center !important;
  border-radius:0 0 30px 30px;
}

/* ===== BUTTONS ===== */

button,
.btn,
input[type="submit"]{
  background:#2563eb !important;
  color:white !important;
  border:none !important;
  padding:12px 22px !important;
  border-radius:10px !important;
  font-weight:bold !important;
  cursor:pointer !important;
}

button:hover,
.btn:hover{
  background:#1d4ed8 !important;
}

/* ===== JOB CARDS ===== */

.card,
.product-card,
.job-card{
  background:white !important;
  border-radius:16px !important;
  box-shadow:0 4px 20px rgba(0,0,0,.08) !important;
  padding:20px !important;
  transition:.3s ease;
}

.card:hover,
.job-card:hover{
  transform:translateY(-4px);
}

/* ===== FOOTER ===== */

footer{
  background:#0f172a !important;
  color:white !important;
  padding:40px 20px !important;
  text-align:center !important;
}

/* ===== HIDE SHOPIFY BRANDING ===== */

a[href*="shopify"]{
  display:none !important;
}

.shopify-section,
.shopify-policy__container{
  max-width:100% !important;
}

</style>
`;

      // ===== CUSTOM TOP BAR =====
      const customHeader = `
<div style="
background:#111827;
color:white;
padding:14px 20px;
font-size:15px;
font-weight:600;
text-align:center;
">
🔥 Find Latest Remote Jobs & Internships
</div>
`;

      // Inject CSS
      body = body.replace(
        "</head>",
        `${customCSS}</head>`
      );

      // Inject Header
      body = body.replace(
        "<body>",
        `<body>${customHeader}`
      );

      // ===== UPDATE JOBPOSTING SCHEMA =====
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
                obj["datePosted"] = "2026-05-06";
                obj["validThrough"] = "2026-12-31";
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

      return res.status(response.status).send(body);
    }

    // =========================================================
    // CSS
    // =========================================================
    if (contentType.includes("text/css")) {
      const body = rewriteText(await response.text());

      res.setHeader("content-type", "text/css");

      return res.status(response.status).send(body);
    }

    // =========================================================
    // XML / SITEMAP
    // =========================================================
    if (
      req.url.includes("sitemap") ||
      contentType.includes("xml")
    ) {
      const body = rewriteText(await response.text());

      res.setHeader(
        "content-type",
        "application/xml; charset=utf-8"
      );

      return res.status(response.status).send(body);
    }

    // =========================================================
    // JAVASCRIPT
    // =========================================================
    if (contentType.includes("javascript")) {
      const body = rewriteText(await response.text());

      res.setHeader("content-type", contentType);

      return res.status(response.status).send(body);
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
      "Proxy error: " + error.message
    );
  }
};
```
