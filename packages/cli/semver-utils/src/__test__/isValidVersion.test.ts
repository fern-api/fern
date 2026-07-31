import { isValidVersion } from "../isValidVersion.js";

describe("isValidVersion", () => {
    it.each`
        version            | expected
        ${"5.45.0"}        | ${true}
        ${"0.0.1"}         | ${true}
        ${"10.20.30"}      | ${true}
        ${"5.45.0-rc0"}    | ${true}
        ${"5.45.0-rc.0"}   | ${true}
        ${"5.45.0-alpha0"} | ${true}
        ${"5.45.0-beta1"}  | ${true}
        ${"5.45.0-4-abc"}  | ${true}
        ${""}              | ${false}
        ${"latest"}        | ${false}
        ${"5.45"}          | ${false}
        ${"5"}             | ${false}
        ${"v5.45.0"}       | ${false}
        ${"not-a-version"} | ${false}
        ${"5.45.0.1"}      | ${false}
    `("$version -> $expected", ({ version, expected }: { version: string; expected: boolean }) => {
        expect(isValidVersion(version)).toBe(expected);
    });
});
