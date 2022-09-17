import { isVersionAhead } from "../isVersionAhead";

describe("isVersionAhead", () => {
    it.each`
        a                  | b                  | expected
        ${"0.0.191"}       | ${"0.0.190"}       | ${true}
        ${"0.0.191"}       | ${"0.0.191"}       | ${false}
        ${"0.0.191"}       | ${"0.0.192"}       | ${false}
        ${"0.0.191"}       | ${"0.0.191-4-abc"} | ${false}
        ${"0.0.191-4-abc"} | ${"0.0.191"}       | ${true}
    `("$a vs. $b", ({ a, b, expected }) => {
        expect(isVersionAhead(a, b)).toBe(expected);
    });
});
