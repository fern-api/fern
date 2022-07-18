import chalk from "chalk";
import { Rule, RuleViolation } from "../../Rule";

export const NoDuplicateServiceNames: Rule = {
    name: "no-duplicate-service-names",
    create: () => {
        const serviceNames: Record<string, string> = {};
        return {
            httpService: ({ serviceName }, { relativeFilePath }) => {
                const violations: RuleViolation[] = [];
                if (serviceNames[serviceName] != null) {
                    const duplicateMessage =
                        serviceNames[serviceName] === relativeFilePath
                            ? `Duplicate lives in same file ${relativeFilePath}`
                            : `Duplicate lives in another file ${relativeFilePath}`;
                    violations.push({
                        severity: "error",
                        message: `Found duplicated service: ${chalk.bold(serviceName)}. ${duplicateMessage}`,
                    });
                } else {
                    serviceNames[serviceName] = relativeFilePath;
                }
                return violations;
            },
        };
    },
};
