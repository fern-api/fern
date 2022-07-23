import chalk from "chalk";
import { Rule } from "../../Rule";

type Id = string;
type RelativeFilePath = string;

export const NoDuplicateIdsRule: Rule = {
    name: "no-duplicate-ids",
    create: () => {
        const idToDeclaredPath: Record<Id, RelativeFilePath> = {};
        return {
            id: (id, { relativeFilePath }) => {
                const idStr = typeof id === "string" ? id : id.name;

                const pathOfDuplicateId = idToDeclaredPath[idStr];
                if (pathOfDuplicateId == null) {
                    idToDeclaredPath[idStr] = relativeFilePath;
                    return [];
                }

                let message = `The ID ${chalk.bold(idStr)} is already declared`;
                if (pathOfDuplicateId !== relativeFilePath) {
                    message += ` in ${chalk.bold(pathOfDuplicateId)}`;
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
