import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import path from "path";
import { loadIntermediateRepresentation } from "../__utils__/loadIntermediateRepresentation";

const ROOT_DIR = path.resolve(__dirname, "..", "..", "..", "..", "..", "..", "..");

// We don't test against all IRs. That happens with the seed tests.
// Instead we choose ones worth writing unit tests for.
// This makes development faster and the tests more focused.
// Note: There is currently a bit of an undeclared dependency in that the IRs need to be generated
// before these tests can be fully up-to-date.
export const IrPaths = {
    MULTI_URL_ENVIRONMENT: path.join(ROOT_DIR, "seed", "ts-sdk", "multi-url-environment", ".config", "ir.json"),
    EXAMPLES: path.join(ROOT_DIR, "seed", "ts-sdk", "examples", "examples-with-api-reference", ".config", "ir.json")
};

export const IrLoader = {
    load: (irPath: keyof typeof IrPaths): Promise<IntermediateRepresentation> => {
        return loadIntermediateRepresentation(IrPaths[irPath]);
    }
};
