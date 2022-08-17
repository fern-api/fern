// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: "Fern",
    tagline: "Define your API once.",
    url: "https://buildwithfern.com",
    baseUrl: "/",
    onBrokenLinks: "throw",
    onBrokenMarkdownLinks: "warn",
    favicon: "img/favicon.ico",

    // Even if you don't use internalization, you can use this field to set useful
    // metadata like html lang. For example, if your site is Chinese, you may want
    // to replace "en" with "zh-Hans".
    i18n: {
        defaultLocale: "en",
        locales: ["en"],
    },

    presets: [
        [
            "classic",
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                // docs: {
                //     routeBasePath: '/', // Serve the docs at the site's root
                //     /* other docs plugin options */
                // },
                blog: false,
                docs: {
                    sidebarPath: require.resolve("./sidebars.js"),
                    // Please change this to your repo.
                    // Remove this to remove the "edit this page" links.
                    editUrl: "https://github.com/fern-api/fern/tree/main/docs",
                },
                theme: {
                    customCss: require.resolve("./src/css/custom.css"),
                },
            }),
        ],
    ],
    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            navbar: {
                title: "Fern",
                logo: {
                    alt: "Fern Logo",
                    src: "img/logo.svg",
                },
                items: [
                    {
                        type: "doc",
                        docId: "intro",
                        position: "left",
                        label: "Docs",
                    },
                    {
                        docId: "intro",
                        position: "left",
                        label: "Pricing",
                        to: "/pricing",
                    },
                    {
                        to: "https://discord.gg/JkkXumPzcG",
                        label: "Discord",
                        position: "left",
                    },
                    {
                        href: "https://github.com/fern-api/fern/",
                        label: "GitHub",
                        position: "right",
                    },
                ],
            },
            colorMode: {
                defaultMode: "dark",
                disableSwitch: true,
            },
            announcementBar: {
                id: "support_us",
                content:
                    '<strong>⭐ Star us <a target="_blank" rel="noopener noreferrer" href="https://github.com/fern-api/fern">on GitHub</a></strong>',
                backgroundColor: "#4276e7",
                textColor: "#fff4f9",
                isCloseable: true,
            },
            algolia: {
                appId: "AMYYWZFEK5",
                apiKey: "00a381cfdddce6ccd637aea674a93282",
                indexName: "buildwithfern",
            },
            footer: {
                style: "dark",
                links: [
                    {
                        title: "Company",
                        items: [
                            {
                                label: "Github",
                                to: "https://github.com/fern-api/fern/",
                            },
                            {
                                label: "Stay updated",
                                to: "mailto:team@buildwithfern.com?subject=Keep%20me%20updated&body=Howdy%20team-%0A%0APlease%20keep%20me%20updated%20as%20functionality%20is%20released%20and%20you%20share%20business%20updates.",
                            },
                        ],
                    },
                    {
                        title: "Legal",
                        items: [
                            {
                                label: "Privacy Policy",
                                to: "/docs/legal/privacy",
                            },
                            {
                                label: "TOS",
                                to: "/docs/legal/terms",
                            },
                            {
                                label: "Cookie Policy",
                                to: "/docs/legal/cookie",
                            },
                        ],
                    },
                ],
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
        }),
};

module.exports = config;
