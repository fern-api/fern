import { readFile } from "fs/promises";
import grayMatter from "gray-matter";

import { Rule } from "../../Rule";

export const ValidFrontmatter: Rule = {
    name: "valid-frontmatter",
    create: () => {
        return {
            filepath: async ({ absoluteFilepath }) => {
                if (!absoluteFilepath.endsWith(".md") && !absoluteFilepath.endsWith(".mdx")) {
                    return [];
                }

                try {
                    const fileContents = await readFile(absoluteFilepath, "utf-8");
                    grayMatter(fileContents);
                    return [];
                } catch (error) {
                    return [
                        {
                            severity: "fatal",
                            message: `Failed to parse frontmatter${error instanceof Error ? `: ${error.message}` : ""}`
                        }
                    ];
                }
            }
        };
    }
};
