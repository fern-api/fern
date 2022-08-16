import React from "react";
import ComponentCreator from "@docusaurus/ComponentCreator";

export default [
    {
        path: "/__docusaurus/debug",
        component: ComponentCreator("/__docusaurus/debug", "56c"),
        exact: true,
    },
    {
        path: "/__docusaurus/debug/config",
        component: ComponentCreator("/__docusaurus/debug/config", "a1b"),
        exact: true,
    },
    {
        path: "/__docusaurus/debug/content",
        component: ComponentCreator("/__docusaurus/debug/content", "366"),
        exact: true,
    },
    {
        path: "/__docusaurus/debug/globalData",
        component: ComponentCreator("/__docusaurus/debug/globalData", "2bc"),
        exact: true,
    },
    {
        path: "/__docusaurus/debug/metadata",
        component: ComponentCreator("/__docusaurus/debug/metadata", "54f"),
        exact: true,
    },
    {
        path: "/__docusaurus/debug/registry",
        component: ComponentCreator("/__docusaurus/debug/registry", "5a4"),
        exact: true,
    },
    {
        path: "/__docusaurus/debug/routes",
        component: ComponentCreator("/__docusaurus/debug/routes", "7bd"),
        exact: true,
    },
    {
        path: "/pricing",
        component: ComponentCreator("/pricing", "5fd"),
        exact: true,
    },
    {
        path: "/search",
        component: ComponentCreator("/search", "e5c"),
        exact: true,
    },
    {
        path: "/docs",
        component: ComponentCreator("/docs", "4e1"),
        routes: [
            {
                path: "/docs/category/concepts",
                component: ComponentCreator("/docs/category/concepts", "ab6"),
                exact: true,
                sidebar: "tutorialSidebar",
            },
            {
                path: "/docs/concepts/API Definition/",
                component: ComponentCreator("/docs/concepts/API Definition/", "c6b"),
                exact: true,
                sidebar: "tutorialSidebar",
            },
            {
                path: "/docs/concepts/API Definition/services",
                component: ComponentCreator("/docs/concepts/API Definition/services", "a25"),
                exact: true,
                sidebar: "tutorialSidebar",
            },
            {
                path: "/docs/concepts/API Definition/types",
                component: ComponentCreator("/docs/concepts/API Definition/types", "8fc"),
                exact: true,
                sidebar: "tutorialSidebar",
            },
            {
                path: "/docs/concepts/generators",
                component: ComponentCreator("/docs/concepts/generators", "c1f"),
                exact: true,
                sidebar: "tutorialSidebar",
            },
            {
                path: "/docs/getting-started",
                component: ComponentCreator("/docs/getting-started", "a24"),
                exact: true,
                sidebar: "tutorialSidebar",
            },
            {
                path: "/docs/intro",
                component: ComponentCreator("/docs/intro", "aed"),
                exact: true,
                sidebar: "tutorialSidebar",
            },
            {
                path: "/docs/reference/comparison-with-openapi",
                component: ComponentCreator("/docs/reference/comparison-with-openapi", "55e"),
                exact: true,
                sidebar: "tutorialSidebar",
            },
            {
                path: "/docs/reference/fern-cli",
                component: ComponentCreator("/docs/reference/fern-cli", "24e"),
                exact: true,
                sidebar: "tutorialSidebar",
            },
            {
                path: "/docs/reference/showcase",
                component: ComponentCreator("/docs/reference/showcase", "b98"),
                exact: true,
                sidebar: "tutorialSidebar",
            },
        ],
    },
    {
        path: "/",
        component: ComponentCreator("/", "afa"),
        exact: true,
    },
    {
        path: "*",
        component: ComponentCreator("*"),
    },
];
