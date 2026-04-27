
  
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://anastasiashimuk.com",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  outDir: "./public",
  exclude: [
    "/admin",
    "/auth/*",
    "/login",
    "/reset-password",
    "/api/*",
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/auth", "/auth/*", "/login", "/reset-password", "/api"],
      },
    ],
  },
  additionalPaths: async (config) => [
    await config.transform(config, "/blog"),
    await config.transform(config, "/group-tours"),
  ],
};
  
