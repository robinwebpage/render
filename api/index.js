module.exports = async (req, res) => {
  const shopifyDomain = "ruwmqs-uq.myshopify.com";
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

    let fetchURL = targetURL;
    let response;
    let redirectCount = 0;

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

      // Handle redirects
      if (
        response.status >= 300 &&
        response.status < 400 &&
        response.headers.get("location")
      ) {
        fetchURL = response.headers.get("location");
        redirectCount++;
        continue;
      }

      break;
    }

    // Copy headers
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    const contentType = response.headers.get("content-type") || "";

    // Inject Google verification meta tag into HTML pages
    if (contentType.includes("text/html")) {
      let html = await response.text();

      const verificationTag = `
<meta name="google-site-verification" content="KRgrLJuXsTw1GqsFnhdqTZI63MdUuBfQpus_25teVNA" />
`;

      html = html.replace("</head>", `${verificationTag}</head>`);

      res.status(response.status).send(html);
    } else {
      // Non-HTML responses
      const buffer = Buffer.from(await response.arrayBuffer());
      res.status(response.status).send(buffer);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Proxy Error");
  }
};
