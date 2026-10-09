import { describe, expect, it } from "vitest";

import {
    BUILTIN_FLAG_NAMES,
    camelToKebab,
    flagNameIsReserved,
    resolveParamFlagName,
    sanitizeFlagName,
    stripTagPrefix,
    toKebabFlag,
    tokenize
} from "../naming.js";

// The camelToKebab vectors mirror the Rust test `test_camel_to_kebab`
// (generators/cli/sdk/src/openapi/parser.rs:5336) so the port stays locked to the runtime.
describe("camelToKebab", () => {
    it.each([
        ["scheduledEvents", "scheduled-events"],
        ["eventTypes", "event-types"],
        ["users", "users"],
        ["dataCompliance", "data-compliance"],
        ["ABC", "a-b-c"],
        ["Channel Settings", "channel-settings"],
        ["Attribute Values", "attribute-values"],
        ["Metafields Batch", "metafields-batch"],
        ["foo--bar", "foo-bar"],
        ["CustomerList", "customer-list"]
    ])("camelToKebab(%j) === %j", (input, expected) => {
        expect(camelToKebab(input)).toBe(expected);
    });
});

describe("tokenize", () => {
    it("splits camelCase on capitals", () => {
        expect(tokenize("customersList")).toEqual(["customers", "list"]);
    });
    it("splits non-camelCase on non-alphanumeric runs", () => {
        expect(tokenize("Customer List")).toEqual(["customer", "list"]);
        expect(tokenize("foo-bar_baz")).toEqual(["foo", "bar", "baz"]);
    });
    it("drops empties and lowercases", () => {
        expect(tokenize("--Foo--")).toEqual(["foo"]);
    });
});

describe("stripTagPrefix", () => {
    it("strips a tag token prefix from the operationId", () => {
        expect(stripTagPrefix("customersList", "Customers")).toBe("list");
    });
    it("is a no-op when the operationId does not start with the tag", () => {
        expect(stripTagPrefix("listCustomers", "Customers")).toBe("listCustomers");
    });
    it("is a no-op when op has no more tokens than the tag", () => {
        expect(stripTagPrefix("customers", "Customers")).toBe("customers");
    });
});

describe("toKebabFlag", () => {
    it.each([
        ["min_start_time", "min-start-time"],
        ["pageToken", "page-token"],
        ["Idempotency-Key", "idempotency-key"],
        ["AccountSid", "account-sid"],
        // Literal dotted body keys keep the dot but the following capital still forces a dash,
        // yielding the mangled `parameter1.-name` — matching Rust to_kebab_flag exactly. This broken
        // shape is precisely why such bodies route through `--json` rather than a dedicated flag.
        ["Parameter1.Name", "parameter1.-name"]
    ])("toKebabFlag(%j) === %j", (input, expected) => {
        expect(toKebabFlag(input)).toBe(expected);
    });
});

describe("sanitizeFlagName", () => {
    it("kebab-cases ordinary names", () => {
        expect(sanitizeFlagName("AccountSid")).toBe("account-sid");
        expect(sanitizeFlagName("pageToken")).toBe("page-token");
    });
    it("treats any non-alphanumeric as a separator", () => {
        expect(sanitizeFlagName("foo.bar")).toBe("foo-bar");
        expect(sanitizeFlagName("foo[bar]")).toBe("foo-bar");
    });
    it("rejects whitespace and control characters", () => {
        expect(sanitizeFlagName("foo bar")).toBeUndefined();
        expect(sanitizeFlagName("foo\tbar")).toBeUndefined();
    });
    it("rejects non-transliterable names", () => {
        expect(sanitizeFlagName("日本語")).toBeUndefined();
    });
    it("rejects names that sanitize to empty", () => {
        expect(sanitizeFlagName("...")).toBeUndefined();
    });
});

describe("flagNameIsReserved", () => {
    it("flags built-in names", () => {
        for (const name of BUILTIN_FLAG_NAMES) {
            expect(flagNameIsReserved(name)).toBe(true);
        }
    });
    it("does not flag ordinary names", () => {
        expect(flagNameIsReserved("account-sid")).toBe(false);
        expect(flagNameIsReserved("profile")).toBe(false);
    });
});

describe("resolveParamFlagName", () => {
    it("uses to_kebab_flag for body params", () => {
        expect(resolveParamFlagName({ location: "body" }, "AccountSid")).toBe("account-sid");
    });
    it("uses sanitize for non-body params", () => {
        expect(resolveParamFlagName({ location: "query" }, "PageSize")).toBe("page-size");
    });
    it("honors an x-fern-parameter-name override verbatim", () => {
        expect(resolveParamFlagName({ location: "query", flagNameOverride: "page-size" }, "PageSize")).toBe(
            "page-size"
        );
    });
    it("appends -param when the flag collides with a built-in", () => {
        expect(resolveParamFlagName({ location: "query" }, "json")).toBe("json-param");
        expect(resolveParamFlagName({ location: "body" }, "format")).toBe("format-param");
    });
    it("returns undefined when a non-body name cannot sanitize", () => {
        expect(resolveParamFlagName({ location: "query" }, "日本語")).toBeUndefined();
    });
});
