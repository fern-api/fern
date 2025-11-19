import { DEFAULT_REQUEST_PARAMETER_NAME } from "@fern-api/ir-generator";
import chalk from "chalk";

import { Rule } from "../../Rule";

export const NoConflictingEndpointParametersRule: Rule = {
  name: "no-conflicting-endpoint-parameters",
  create: () => {
    return {
      definitionFile: {
        pathParameter: ({ pathParameterKey }) => {
          if (pathParameterKey === DEFAULT_REQUEST_PARAMETER_NAME) {
            return [
              {
                severity: "fatal",
                message: `The path parameter name ${chalk.bold(DEFAULT_REQUEST_PARAMETER_NAME)} is reserved and conflicts with the request body parameter used in generated code. Please rename this path parameter to avoid the conflict (e.g., 'request_id', 'request_identifier', or 'req_id').`
              }
            ];
          } else {
            return [];
          }
        }
      }
    };
  }
};
