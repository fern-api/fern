/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../../index.js";
import * as SeedTrace from "../../../../api/index.js";
import * as core from "../../../../core/index.js";
import { SubmissionId } from "./SubmissionId.js";
import { ExpressionLocation } from "./ExpressionLocation.js";
import { StackInformation } from "./StackInformation.js";

export const TraceResponse: core.serialization.ObjectSchema<serializers.TraceResponse.Raw, SeedTrace.TraceResponse> =
    core.serialization.object({
        submissionId: SubmissionId,
        lineNumber: core.serialization.number(),
        returnValue: core.serialization.lazy(() => serializers.DebugVariableValue).optional(),
        expressionLocation: ExpressionLocation.optional(),
        stack: StackInformation,
        stdout: core.serialization.string().optional(),
    });

export declare namespace TraceResponse {
    export interface Raw {
        submissionId: SubmissionId.Raw;
        lineNumber: number;
        returnValue?: serializers.DebugVariableValue.Raw | null;
        expressionLocation?: ExpressionLocation.Raw | null;
        stack: StackInformation.Raw;
        stdout?: string | null;
    }
}
