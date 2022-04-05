import produce from "immer";
import { createOverridablePackageValueSupplierWithArgument } from "../OverridablePackageValue";
import { createJsonFileWriter } from "./utils/createJsonFileWriter";

export const writeDepcheckRc = createJsonFileWriter({
    relativePath: ".depcheckrc.json",
    isForBundlesOnly: false,
    generateJson: createOverridablePackageValueSupplierWithArgument({
        getDefaultValue: generateDepcheckRc,
        getValueForBundle: (depcheckRc) =>
            produce(depcheckRc, (draft) => {
                if (draft["ignore-patterns"] == null) {
                    draft["ignore-patterns"] = [];
                }
                draft["ignore-patterns"].push("craco.config.js", "setupTests.ts", "deploy");
            }),
    }),
});

interface DepcheckConfig {
    ignores?: string[];
    "ignore-patterns"?: string[];
}

function generateDepcheckRc(): DepcheckConfig {
    return {
        ignores: ["sass"],
        "ignore-patterns": ["lib", ".eslintrc.json"],
    };
}
