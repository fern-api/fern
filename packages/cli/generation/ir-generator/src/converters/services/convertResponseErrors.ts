import { RawSchemas } from "@fern-api/yaml-schema";
import { ResponseErrors } from "@fern-fern/ir-sdk/api";
import { FernFileContext } from "../../FernFileContext";
import { parseErrorName } from "../../utils/parseErrorName";

export function convertResponseErrors({
    errors,
    file
}: {
    errors: RawSchemas.ResponseErrorsSchema | undefined;
    file: FernFileContext;
}): ResponseErrors {
    return errors == null
        ? []
        : Object.values(errors).map((errorReference) => {
              const referenceToError = typeof errorReference === "string" ? errorReference : errorReference.error;
              const errorName = parseErrorName({
                  errorName: referenceToError,
                  file
              });
              return {
                  docs: typeof errorReference !== "string" ? errorReference.docs : undefined,
                  error: errorName
              };
          });
}
