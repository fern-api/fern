import { describe, expect, it } from "vitest";
import { selectExamplesForSnippets } from "../utils/selectExamplesForSnippets.js";

type Example = { id: string; isUserSpecified?: boolean };

const user = (id: string): Example => ({ id, isUserSpecified: true });
const auto = (id: string): Example => ({ id, isUserSpecified: false });

describe("selectExamplesForSnippets", () => {
    it("returns [] for empty or undefined input", () => {
        expect(selectExamplesForSnippets<Example>(undefined)).toEqual([]);
        expect(selectExamplesForSnippets<Example>([])).toEqual([]);
    });

    it("returns all user examples when present, ignoring auto", () => {
        const examples: Example[] = [user("u1"), auto("a1"), user("u2"), auto("a2")];
        expect(selectExamplesForSnippets(examples)).toEqual([user("u1"), user("u2")]);
    });

    it("falls back to first auto example only when no user examples exist", () => {
        const examples: Example[] = [auto("a1"), auto("a2"), auto("a3")];
        expect(selectExamplesForSnippets(examples)).toEqual([auto("a1")]);
    });

    it("treats untagged examples (legacy IR) as auto", () => {
        const examples: Example[] = [{ id: "legacy1" }, { id: "legacy2" }];
        expect(selectExamplesForSnippets(examples)).toEqual([{ id: "legacy1" }]);
    });

    it("prefers user examples over untagged legacy examples", () => {
        const examples: Example[] = [{ id: "legacy" }, user("u1")];
        expect(selectExamplesForSnippets(examples)).toEqual([user("u1")]);
    });
});
