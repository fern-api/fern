import { findExternalNpmImports, isExternalNpmPackage } from "../no-external-npm-dependencies";

// For now, let's just test the core logic functions directly
// since the full integration testing requires a complex setup

describe("findExternalNpmImports", () => {
    it("should find external npm imports", () => {
        const content = `
import axios from "axios";
import { format } from "date-fns";
import React from "react";
import "./styles.css";
`;

        const imports = findExternalNpmImports(content);
        expect(imports).toHaveLength(2);
        expect(imports[0]).toEqual({
            packageName: "axios",
            line: 2
        });
        expect(imports[1]).toEqual({
            packageName: "date-fns",
            line: 3
        });
    });

    it("should handle require statements", () => {
        const content = `
const axios = require("axios");
const React = require("react");
`;

        const imports = findExternalNpmImports(content);
        expect(imports).toHaveLength(1);
        expect(imports[0]).toEqual({
            packageName: "axios",
            line: 2
        });
    });

    it("should handle dynamic imports", () => {
        const content = `
const lodash = await import("lodash");
const react = await import("react");
`;

        const imports = findExternalNpmImports(content);
        expect(imports).toHaveLength(1);
        expect(imports[0]).toEqual({
            packageName: "lodash",
            line: 2
        });
    });

    it("should ignore relative imports", () => {
        const content = `
import helper from "./helper";
import utils from "../utils";
import config from "/absolute/path";
`;

        const imports = findExternalNpmImports(content);
        expect(imports).toHaveLength(0);
    });
});

describe("isExternalNpmPackage", () => {
    it("should identify external npm packages", () => {
        expect(isExternalNpmPackage("lodash")).toBe(true);
        expect(isExternalNpmPackage("@docusaurus/useBaseUrl")).toBe(true);
        expect(isExternalNpmPackage("axios")).toBe(true);
    });

    it("should allow React packages", () => {
        expect(isExternalNpmPackage("react")).toBe(false);
        expect(isExternalNpmPackage("react-dom")).toBe(false);
        expect(isExternalNpmPackage("react/jsx-runtime")).toBe(false);
    });

    it("should allow built-in Node.js modules", () => {
        expect(isExternalNpmPackage("path")).toBe(false);
        expect(isExternalNpmPackage("fs")).toBe(false);
        expect(isExternalNpmPackage("url")).toBe(false);
    });

    it("should reject relative imports", () => {
        expect(isExternalNpmPackage("./helper")).toBe(false);
        expect(isExternalNpmPackage("../utils")).toBe(false);
        expect(isExternalNpmPackage("/absolute/path")).toBe(false);
    });
});
