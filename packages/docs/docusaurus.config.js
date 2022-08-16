// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: "Fern",
    tagline: "Define your API once. Keep your server, SDKs, and docs in sync.",
    url: "https://buildwithfern.com",
    baseUrl: "/",
    onBrokenLinks: "throw",
    onBrokenMarkdownLinks: "warn",
    favicon: "img/favicon.ico",

    // GitHub pages deployment config.
    // If you aren't using GitHub pages, you don't need these.
    organizationName: "fern", // Usually your GitHub org/user name.
    projectName: "fern-api", // Usually your repo name.

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
                        type: "html",
                        position: "right",
                        value: '<iframe class="ghButton_pHgp" src="https://ghbtns.com/github-btn.html?user=fern-api&amp;repo=fern&amp;type=star&amp;count=true&amp;size=large" frameborder="0" scrolling="0" width="150" height="30" title="GitHub"></iframe>',
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
                    '<strong>Star us <a target="_blank" rel="noopener noreferrer" href="https://github.com/fern-api/fern">on GitHub</a></strong>',
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
                logo: {
                    alt: "Fern",
                    src: "img/logo.svg",
                    style: { height: "30px" },
                },
                links: [
                    {
                        title: "Company",
                        items: [
                            {
                                label: "About",
                                to: "/",
                            },
                            {
                                label: "Careers",
                                to: "/",
                            },
                            {
                                label: "Stay updated",
                                to: "/",
                            },
                        ],
                    },
                    {
                        title: "Legal",
                        items: [
                            {
                                label: "Privacy Policy",
                                href: "/",
                            },
                            {
                                label: "TOS",
                                href: "/",
                            },
                            {
                                label: "Cookie Policy",
                                href: "/",
                            },
                        ],
                    },
                ],
                copyright: `Copyright © ${new Date().getFullYear()} Fern Inc.<br/><span>Fern is open source software licensed under the <a href="https://github.com/fern-api/fern/blob/main/LICENSE">MIT License</a></span>`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
        }),
};

module.exports = config;
