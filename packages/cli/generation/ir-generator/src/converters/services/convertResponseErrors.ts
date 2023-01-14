import { RawSchemas } from "@fern-api/yaml-schema";
import { ResponseErrors } from "@fern-fern/ir-model/http";
import { FernFileContext } from "../../FernFileContext";
import { parseTypeName } from "../../utils/parseTypeName";

export function convertResponseErrors({
    errors,
    file,
}: {
    errors: RawSchemas.ResponseErrorsSchema | undefined;
    file: FernFileContext;
}): ResponseErrors {
    return errors == null
        ? []
        : Object.values(errors).map((errorReference) => {
              const errorTypeName = typeof errorReference === "string" ? errorReference : errorReference.error;
              const parsedErrorTypeName = parseTypeName({
                  typeName: errorTypeName,
                  file,
              });
              return {
                  docs: typeof errorReference !== "string" ? errorReference.docs : undefined,
                  error: parsedErrorTypeName,
              };
          });
}
