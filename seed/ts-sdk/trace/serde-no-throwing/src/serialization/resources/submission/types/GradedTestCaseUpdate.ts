/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index.js";
import * as SeedTrace from "../../../../api/index.js";
import * as core from "../../../../core/index.js";
import { TestCaseId } from "../../v2/resources/problem/types/TestCaseId.js";
import { TestCaseGrade } from "./TestCaseGrade.js";

export const GradedTestCaseUpdate: core.serialization.ObjectSchema<
    serializers.GradedTestCaseUpdate.Raw,
    SeedTrace.GradedTestCaseUpdate
> = core.serialization.object({
    testCaseId: TestCaseId,
    grade: TestCaseGrade,
});

export declare namespace GradedTestCaseUpdate {
    export interface Raw {
        testCaseId: TestCaseId.Raw;
        grade: TestCaseGrade.Raw;
    }
}
