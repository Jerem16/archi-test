const fs = require("fs");
const { SitemapStream } = require("sitemap");

const siteUrl = "https://mobile.peur-de-la-conduite.fr"; // ou desktop selon ton cas

const links = [
    { url: "/", changefreq: "daily", priority: 1.0 },
    { url: "/contact", changefreq: "monthly", priority: 0.8 },
    { url: "/services", changefreq: "monthly", priority: 0.8 },
    { url: "/tarifs", changefreq: "monthly", priority: 0.8 },
    { url: "/blog", changefreq: "monthly", priority: 0.8 },
];

const sitemap = new SitemapStream({ hostname: siteUrl });
const writeStream = fs.createWriteStream("public/sitemap.xml");

sitemap.pipe(writeStream);
links.forEach((link) => sitemap.write(link));
sitemap.end();

writeStream.on("finish", () => {
    console.log("✅ Sitemap généré dans /public/sitemap.xml");
});
