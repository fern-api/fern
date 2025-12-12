import { vi } from "vitest";

import { replaceEnvVariables } from "../replaceEnvVars";

describe("replaceEnvVariables", () => {
    it("works and can replace templated env vars, even when they are nested", () => {
        process.env.FOO_VAR = "foo";
        process.env.BAR_VAR = "bar";
        const content = {
            foo: "bar",
            baz: {
                qux: {
                    thud: "${FOO_VAR}"
                }
            },
            plugh: "${FOO_VAR}-${BAR_VAR}"
        };

        const onError = vi.fn();
        const substituted = replaceEnvVariables(content, { onError });

        expect(substituted).toEqual({ foo: "bar", baz: { qux: { thud: "foo" } }, plugh: "foo-bar" });
    });

    it("fails with undefined env var", () => {
        process.env.FOO_VAR = "foo";
        const content = {
            foo: "bar",
            baz: {
                qux: {
                    thud: "${UNDEFINED_ENV_VAR}"
                }
            },
            plugh: "${FOO_VAR}"
        };
        const onError = vi.fn();
        replaceEnvVariables(content, { onError }, { substituteAsEmpty: false });
        expect(onError).toHaveBeenCalled();
    });

    it("Always substitutes empty string when flag is set", () => {
        process.env.FOO_VAR = "foo";
        const content = {
            foo: "bar",
            baz: {
                qux: {
                    thud: "${UNDEFINED_ENV_VAR}"
                }
            },
            plugh: "${FOO_VAR}"
        };
        const onError = vi.fn();
        const substituted = replaceEnvVariables(content, { onError }, { substituteAsEmpty: true });

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted.foo).toEqual("bar");
        expect(substituted.baz.qux.thud).toEqual("");
        expect(substituted.plugh).toEqual("");
    });

    it("converts escaped env var pattern to literal without substitution", () => {
        process.env.HOST = "example.com";
        const content = {
            escaped: "http://\\$\\{HOST\\}",
            normal: "${HOST}"
        };
        const onError = vi.fn();
        const substituted = replaceEnvVariables(content, { onError });

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted.escaped).toEqual("http://${HOST}");
        expect(substituted.normal).toEqual("example.com");
    });

    it("handles mixed escaped and non-escaped patterns in same string", () => {
        process.env.API_KEY = "secret123";
        const content = "Use \\$\\{API_KEY\\} syntax to reference ${API_KEY}";
        const onError = vi.fn();
        const substituted = replaceEnvVariables(content, { onError });

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted).toEqual("Use ${API_KEY} syntax to reference secret123");
    });

    it("escaped patterns are not substituted even with substituteAsEmpty flag", () => {
        const content = "http://\\$\\{HOST\\}";
        const onError = vi.fn();
        const substituted = replaceEnvVariables(content, { onError }, { substituteAsEmpty: true });

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted).toEqual("http://${HOST}");
    });

    it("substitutes env vars in arrays of strings", () => {
        process.env.ARRAY_VAR = "array-value";
        const content = ["static", "${ARRAY_VAR}", "another-static"];
        const onError = vi.fn();
        const substituted = replaceEnvVariables(content, { onError });

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted).toEqual(["static", "array-value", "another-static"]);
    });

    it("substitutes env vars in arrays of objects", () => {
        process.env.TITLE_VAR = "My Title";
        process.env.URL_VAR = "https://example.com";
        const content = [
            { title: "${TITLE_VAR}", url: "${URL_VAR}" },
            { title: "Static Title", url: "https://static.com" }
        ];
        const onError = vi.fn();
        const substituted = replaceEnvVariables(content, { onError });

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted).toEqual([
            { title: "My Title", url: "https://example.com" },
            { title: "Static Title", url: "https://static.com" }
        ]);
    });

    it("substitutes env vars in nested arrays within objects", () => {
        process.env.NESTED_VAR = "nested-value";
        const content = {
            items: [{ name: "${NESTED_VAR}" }, { name: "static" }],
            links: ["${NESTED_VAR}", "static-link"]
        };
        const onError = vi.fn();
        const substituted = replaceEnvVariables(content, { onError });

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted).toEqual({
            items: [{ name: "nested-value" }, { name: "static" }],
            links: ["nested-value", "static-link"]
        });
    });

    it("substitutes env vars in deeply nested arrays", () => {
        process.env.DEEP_VAR = "deep-value";
        const content = {
            level1: {
                level2: [
                    {
                        level3: [{ value: "${DEEP_VAR}" }]
                    }
                ]
            }
        };
        const onError = vi.fn();
        const substituted = replaceEnvVariables(content, { onError });

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted).toEqual({
            level1: {
                level2: [
                    {
                        level3: [{ value: "deep-value" }]
                    }
                ]
            }
        });
    });

    it("substitutes env vars in docs instances config including custom domains", () => {
        process.env.DOCS_URL = "my-docs.docs.buildwithfern.com";
        process.env.CUSTOM_DOMAIN = "docs.example.com";
        process.env.CUSTOM_DOMAIN_2 = "api.example.com";
        const instances = [
            {
                url: "${DOCS_URL}",
                customDomain: "${CUSTOM_DOMAIN}"
            },
            {
                url: "static.docs.buildwithfern.com",
                customDomain: ["${CUSTOM_DOMAIN}", "${CUSTOM_DOMAIN_2}"]
            }
        ];
        const onError = vi.fn();
        const substituted = replaceEnvVariables(instances, { onError });

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted).toEqual([
            {
                url: "my-docs.docs.buildwithfern.com",
                customDomain: "docs.example.com"
            },
            {
                url: "static.docs.buildwithfern.com",
                customDomain: ["docs.example.com", "api.example.com"]
            }
        ]);
    });

    it("throws error for missing env vars in docs instances config when substituteAsEmpty is false", () => {
        process.env.DOCS_URL = "my-docs.docs.buildwithfern.com";
        const instances = [
            {
                url: "${DOCS_URL}",
                customDomain: "${MISSING_CUSTOM_DOMAIN}"
            }
        ];
        const onError = vi.fn();
        replaceEnvVariables(instances, { onError }, { substituteAsEmpty: false });

        expect(onError).toHaveBeenCalled();
    });

    it("substitutes empty string for missing env vars in docs instances when substituteAsEmpty is true", () => {
        const instances = [
            {
                url: "${MISSING_DOCS_URL}",
                customDomain: "${MISSING_CUSTOM_DOMAIN}"
            }
        ];
        const onError = vi.fn();
        const substituted = replaceEnvVariables(instances, { onError }, { substituteAsEmpty: true });

        expect(onError).toHaveBeenCalledTimes(0);
        expect(substituted).toEqual([
            {
                url: "",
                customDomain: ""
            }
        ]);
    });
});
