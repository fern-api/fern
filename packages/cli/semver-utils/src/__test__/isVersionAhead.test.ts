import { isVersionAhead } from "../isVersionAhead";

describe("isVersionAhead", () => {
    it.each`
        a                   | b                  | expected
        ${"0.0.191"}        | ${"0.0.190"}       | ${true}
        ${"0.0.191"}        | ${"0.0.191"}       | ${false}
        ${"0.0.191"}        | ${"0.0.192"}       | ${false}
        ${"0.0.191"}        | ${"0.0.191-4-abc"} | ${false}
        ${"0.0.191-4-abc"}  | ${"0.0.191"}       | ${true}
        ${"0.0.191-2-abc"}  | ${"0.0.191-1-abc"} | ${true}
        ${"0.0.191-11-abc"} | ${"0.0.191-2-abc"} | ${true}
        ${"0.0.191-rc0"}    | ${"0.0.190"}       | ${true}
        ${"0.0.191-rc0"}    | ${"0.0.191"}       | ${false}
        ${"0.0.191-rc0"}    | ${"0.0.192"}       | ${false}
        ${"0.0.191-rc0"}    | ${"0.0.191-4-abc"} | ${false}
        ${"0.0.191-rc2"}    | ${"0.0.191-rc1"}   | ${true}
        ${"0.0.191-rc2"}    | ${"0.0.191-rc11"}  | ${false}
    `("$a vs. $b", ({ a, b, expected }) => {
        expect(isVersionAhead(a, b)).toBe(expected);
    });
});
