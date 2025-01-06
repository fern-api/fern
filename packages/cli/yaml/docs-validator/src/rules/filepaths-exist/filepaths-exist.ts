import { doesPathExist } from "@fern-api/fs-utils";

import { Rule } from "../../Rule";

export const FilepathsExistRule: Rule = {
    name: "filepaths-exist",
    create: () => {
        return {
            filepath: async ({ absoluteFilepath, value }) => {
                if (!(await doesPathExist(absoluteFilepath))) {
                    return [
                        {
                            severity: "error",
                            message: `Path ${value} does not exist`
                        }
                    ];
                }
                return [];
            }
        };
    }
};
