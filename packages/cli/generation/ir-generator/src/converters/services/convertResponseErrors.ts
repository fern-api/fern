import { RelativeFilePath } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFilepath } from "@fern-fern/ir-model/commons";
import { ResponseErrors } from "@fern-fern/ir-model/services/commons";
import { parseTypeName } from "../../utils/parseTypeName";

export function convertResponseErrors({
    errors,
    fernFilepath,
    imports,
}: {
    errors: RawSchemas.ResponseErrorsSchema | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, RelativeFilePath>;
}): ResponseErrors {
    return errors == null
        ? []
        : Object.values(errors).map((errorReference) => {
              const errorTypeName = typeof errorReference === "string" ? errorReference : errorReference.error;
              const parsedErrorTypeName = parseTypeName({
                  typeName: errorTypeName,
                  fernFilepath,
                  imports,
              });
              return {
                  docs: typeof errorReference !== "string" ? errorReference.docs : undefined,
                  error: parsedErrorTypeName,
              };
          });
}
