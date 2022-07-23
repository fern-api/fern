import chalk from "chalk";
import { Rule } from "../../Rule";

type ServiceName = string;
type RelativeFilePath = string;

export const NoDuplicateServiceNames: Rule = {
    name: "no-duplicate-service-names",
    create: () => {
        const serviceNameToDeclaredPath: Record<ServiceName, RelativeFilePath> = {};
        return {
            httpService: ({ serviceName }, { relativeFilePath }) => {
                const pathOfDuplicateServiceName = serviceNameToDeclaredPath[serviceName];
                if (pathOfDuplicateServiceName == null) {
                    serviceNameToDeclaredPath[serviceName] = relativeFilePath;
                    return [];
                }

                let message = `A service with the name ${chalk.bold(serviceName)} is already declared`;
                if (pathOfDuplicateServiceName !== relativeFilePath) {
                    message += ` in ${chalk.bold(pathOfDuplicateServiceName)}`;
                }
                message += ".";

                return [
                    {
                        severity: "error",
                        message,
                    },
                ];
            },
        };
    },
};
