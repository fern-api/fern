/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../../../index";
import * as SeedTrace from "../../../../../../api/index";
import * as core from "../../../../../../core";
import { ProblemDescription } from "../../../../problem/types/ProblemDescription";
import { CustomFiles } from "./CustomFiles";
import { TestCaseTemplate } from "./TestCaseTemplate";
import { TestCaseV2 } from "./TestCaseV2";
import { Language } from "../../../../commons/types/Language";

export const CreateProblemRequestV2: core.serialization.ObjectSchema<
    serializers.v2.CreateProblemRequestV2.Raw,
    SeedTrace.v2.CreateProblemRequestV2
> = core.serialization.object({
    problemName: core.serialization.string(),
    problemDescription: ProblemDescription,
    customFiles: CustomFiles,
    customTestCaseTemplates: core.serialization.list(TestCaseTemplate),
    testcases: core.serialization.list(TestCaseV2),
    supportedLanguages: core.serialization.set(Language),
    isPublic: core.serialization.boolean(),
});

export declare namespace CreateProblemRequestV2 {
    export interface Raw {
        problemName: string;
        problemDescription: ProblemDescription.Raw;
        customFiles: CustomFiles.Raw;
        customTestCaseTemplates: TestCaseTemplate.Raw[];
        testcases: TestCaseV2.Raw[];
        supportedLanguages: Language.Raw[];
        isPublic: boolean;
    }
}
