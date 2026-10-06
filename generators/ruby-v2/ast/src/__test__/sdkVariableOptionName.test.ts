import { getSdkVariableOptionNames } from "../sdkVariableOptionName.js";

describe("getSdkVariableOptionNames", () => {
    it("keeps non-colliding names as-is", () => {
        expect(getSdkVariableOptionNames(["target_account_sid", "region"])).toEqual(["target_account_sid", "region"]);
    });

    it("prefixes names that collide with existing client options", () => {
        expect(getSdkVariableOptionNames(["base_url", "timeout"])).toEqual(["variable_base_url", "variable_timeout"]);
    });

    it("avoids caller-supplied reserved names such as credentials and headers", () => {
        expect(getSdkVariableOptionNames(["api_key", "region"], ["api_key", "x_api_version"])).toEqual([
            "variable_api_key",
            "region"
        ]);
    });

    it("never produces duplicate keywords", () => {
        expect(getSdkVariableOptionNames(["root_variable", "root_variable", "root_variable"])).toEqual([
            "root_variable",
            "variable_root_variable",
            "variable_root_variable_2"
        ]);
        expect(getSdkVariableOptionNames(["variable_base_url", "base_url"])).toEqual([
            "variable_base_url",
            "variable_base_url_2"
        ]);
    });
});
