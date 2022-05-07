import { CompilerStage, FernFile } from "@fern-api/compiler-commons";
import { parse } from "./parse";
import { SyntaxAnalysis } from "./types";
import { validate } from "./validate";

export const SyntaxAnalysisStage: CompilerStage<
    readonly FernFile[],
    SyntaxAnalysis.SuccessfulResult,
    SyntaxAnalysis.FailedResult
> = {
    run: async (files) => {
        const parseResult = await parse(files);
        if (!parseResult.didSucceed) {
            return {
                didSucceed: false,
                failures: parseResult.failures,
            };
        }

        const validationResult = validate(parseResult.files);
        if (!validationResult.didSucceed) {
            return {
                didSucceed: false,
                failures: validationResult.failures,
            };
        }

        return {
            didSucceed: true,
            result: validationResult,
        };
    },
};
