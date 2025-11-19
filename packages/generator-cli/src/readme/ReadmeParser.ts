import { snakeCase } from "es-toolkit/string";

import { Block } from "./Block";

export interface ParseResult {
    header: string;
    blocks: Block[];
}

export class ReadmeParser {
    public parse({ content }: { content: string }): ParseResult {
        let header = "";
        let currentBlock: Block | undefined;
        const blocks: Block[] = [];
        const lines = content.split("\n");
        for (const line of lines) {
            const h2Match = line.match(/^##\s+(.*)/);
            if (h2Match) {
                if (currentBlock && !this.isCoreBlock(currentBlock.id)) {
                    blocks.push(currentBlock);
                }
                currentBlock = new Block({
                    id: sectionNameToID(h2Match[1] ?? ""),
                    content: ""
                });
            }
            if (currentBlock == null) {
                header += line;
                continue;
            }
            currentBlock.content += `${line}\n`;
        }

        // Don't forget to push the last block
        if (currentBlock && !this.isCoreBlock(currentBlock.id)) {
            blocks.push(currentBlock);
        }

        return {
            header,
            blocks
        };
    }

    private isCoreBlock(blockId: string): boolean {
        return blockId === "TABLE_OF_CONTENTS" || blockId === "CONTENTS";
    }
}

function sectionNameToID(sectionName: string): string {
    return snakeCase(
        sectionName
            .split(" ")
            .map((word, index) => {
                if (index === 0) {
                    return word;
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join("")
    ).toUpperCase();
}
