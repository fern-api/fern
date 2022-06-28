import { RawSchemas } from "@fern-api/syntax-analysis";
import { FailedResponse } from "@fern-fern/ir-model/services/commons";
import { FernFilepath } from "@fern-fern/ir-model/types";
import { parseTypeName } from "../../utils/parseTypeName";

export function convertFailedResponse({
    rawFailedResponse,
    fernFilepath,
    imports,
}: {
    rawFailedResponse: RawSchemas.FailedResponseSchema | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
}): FailedResponse {
    return {
        docs: rawFailedResponse?.docs,
        discriminant: rawFailedResponse?.discriminant ?? "_error",
        errorProperties: {
            errorInstanceId: "_errorInstanceId",
        },
        errors:
            rawFailedResponse?.errors == null
                ? []
                : Object.values(rawFailedResponse.errors).map((errorReference) => {
                      const errorTypeName = typeof errorReference === "string" ? errorReference : errorReference.error;
                      const parsedErrorTypeName = parseTypeName({
                          typeName: errorTypeName,
                          fernFilepath,
                          imports,
                      });
                      return {
                          docs: typeof errorReference !== "string" ? errorReference.docs : undefined,
                          discriminantValue: parsedErrorTypeName.name,
                          error: parsedErrorTypeName,
                      };
                  }),
    };
}
