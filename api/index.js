// ===== REMOVE DISCLAIMER TEXT/BANNERS =====
body = body.replace(/This site is not affiliated with.*?<\/div>/gis, "");
body = body.replace(/Disclaimer:.*?<\/p>/gis, "");

// Remove elements by common class/id names
body = body.replace(
  /<[^>]*(disclaimer|warning|notice)[^>]*>[\s\S]*?<\/[^>]+>/gi,
  ""
);


// ===== CUSTOM WEBSITE DESIGN =====
const customCSS = `
<style>
/* Global */
body{
  font-family: Arial, sans-serif !important;
  background:#f4f7fb !important;
  color:#222 !important;
  margin:0;
  padding:0;
}

/* Header */
header, .header{
  background:#0f172a !important;
  padding:18px 30px !important;
  box-shadow:0 2px 10px rgba(0,0,0,.1);
}

/* Logo */
header img{
  max-height:55px !important;
}

/* Navigation */
nav a{
  color:#fff !important;
  font-weight:600 !important;
  margin:0 12px !important;
  text-decoration:none !important;
}

/* Hero Banner */
.hero, .banner{
  background:linear-gradient(135deg,#2563eb,#1e40af) !important;
  color:#fff !important;
  padding:80px 20px !important;
  text-align:center !important;
  border-radius:0 0 30px 30px;
}

/* Buttons */
button,
.btn,
input[type="submit"]{
  background:#2563eb !important;
  color:#fff !important;
  border:none !important;
  padding:12px 22px !important;
  border-radius:10px !important;
  cursor:pointer !important;
  font-weight:bold !important;
}

button:hover,
.btn:hover{
  background:#1d4ed8 !important;
}

/* Cards */
.card,
.product-card,
.job-card{
  background:#fff !important;
  border-radius:16px !important;
  box-shadow:0 4px 20px rgba(0,0,0,.08) !important;
  padding:20px !important;
  transition:.3s ease;
}

.card:hover{
  transform:translateY(-4px);
}

/* Footer */
footer{
  background:#0f172a !important;
  color:#fff !important;
  padding:40px 20px !important;
  text-align:center !important;
}
</style>
`;


// ===== OPTIONAL CUSTOM HEADER =====
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


// Inject CSS before </head>
body = body.replace("</head>", `${customCSS}</head>`);

// Inject custom header after <body>
body = body.replace("<body>", `<body>${customHeader}`);
