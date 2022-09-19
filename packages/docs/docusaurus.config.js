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
                    // Remove this to remove the "edit this page" links.
                    editUrl: "https://github.com/fern-api/fern/tree/main/docs",
                },
                theme: {
                    customCss: require.resolve("./src/css/custom.css"),
                },
            }),
        ],
    ],
    plugins: ["posthog-docusaurus"],
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
                    // {
                    //     docId: "intro",
                    //     position: "left",
                    //     label: "Pricing",
                    //     to: "/pricing",
                    // },
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
                defaultMode: "light",
                disableSwitch: false,
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
                apiKey: "100c54cd18374a562311359d03e8c812",
                indexName: "fern",
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
            posthog: {
                apiKey: "phc_yQgAEdJJkVpI24NdSRID2mor1x1leRpDoC9yZ9mfXal",
                enableInDevelopment: false,
            },
            docs: {
                sidebar: {
                    hideable: true,
                },
            },
        }),
};

module.exports = config;
