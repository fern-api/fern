import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFilepath } from "@fern-fern/ir-model";
import { ResponseErrors } from "@fern-fern/ir-model/services";
import { parseTypeName } from "../../utils/parseTypeName";

export function convertResponseErrors({
    errors,
    fernFilepath,
    imports,
}: {
    errors: RawSchemas.ResponseErrorsSchema | undefined;
    fernFilepath: FernFilepath;
    imports: Record<string, string>;
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
                  discriminantValue: parsedErrorTypeName.name,
                  error: parsedErrorTypeName,
              };
          });
}
