import * as prettier from "prettier2";

import { assertNever, assertNeverNoThrow } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";

const LANG_SERVER_BANNER =
    "# yaml-language-server: $schema=https://raw.githubusercontent.com/fern-api/fern/main/fern.schema.json";

const YAML_KEY_REGEX = /^(\s*)(\S+):.*$/;

type FernFileCursorLocation =
    | keyof RawSchemas.DefinitionFileSchema
    | "endpoint"
    | "webhook"
    | "type"
    | "error"
    | "unknown";

export class FernDefinitionFileFormatter {
    private tabWidth: number | undefined;
    private fileContents: string;
    private formatted: string | undefined;

    constructor({ fileContents }: { fileContents: string }) {
        this.fileContents = fileContents;
    }

    public async format(): Promise<string> {
        if (this.formatted == null) {
            const { header, body } = await this.splitFileAtHeader();

            const writer = new FileWriter();

            if (!this.fileContents.includes("yaml-language-server")) {
                writer.writeLine(LANG_SERVER_BANNER);
                writer.writeLine();
            }
            if (header.length > 0) {
                for (const headerLine of header) {
                    writer.writeLine(headerLine);
                    writer.writeLine();
                }
            }

            const reader = new LineReader(body);
            let location: FernFileCursorLocation = "unknown";
            while (!reader.isEof()) {
                location = this.writeNextLine({ nextLine: reader.readNextLine(), writer, location });
            }
            this.formatted = await this.prettierFormat(writer.getContent());
        }
        return this.formatted;
    }

    private async splitFileAtHeader(): Promise<{ header: string[]; body: string[] }> {
        const lines = (await this.prettierFormat(this.fileContents)).split("\n");

        const indexOfSeparator = lines.findIndex((line) => {
            const trimmed = line.trim();
            return trimmed.length === 0 || !trimmed.startsWith("#");
        });

        return {
            header: lines.slice(0, indexOfSeparator),
            body: lines.slice(indexOfSeparator).filter((line) => line.trim().length > 0)
        };
    }

    private async prettierFormat(content: string): Promise<string> {
        return prettier.format(content, {
            parser: "yaml"
        });
    }

    private writeNextLine({
        nextLine,
        writer,
        location: previousLocation
    }: {
        nextLine: string;
        writer: FileWriter;
        location: FernFileCursorLocation;
    }): FernFileCursorLocation {
        const newCursorLocation = this.getNewCursorLocation({ previousLocation, line: nextLine });
        if (newCursorLocation != null) {
            writer.writeLine();
        }

        writer.writeLine(nextLine);

        return newCursorLocation ?? previousLocation;
    }

    /**
     * returns new cursor location, if changing locations (e.g. new section or between types).
     * returns undefined if not changing locations.
     */
    private getNewCursorLocation({
        previousLocation,
        line
    }: {
        previousLocation: FernFileCursorLocation | undefined;
        line: string;
    }): FernFileCursorLocation | undefined {
        const match = line.match(YAML_KEY_REGEX);
        if (match == null) {
            return undefined;
        }

        const [_, indentStr, key] = match;
        if (indentStr == null || key == null) {
            return undefined;
        }
        if (this.tabWidth == null && indentStr.length > 0) {
            this.tabWidth = indentStr.length;
        }
        const indent = this.tabWidth != null ? indentStr.length / this.tabWidth : 0;

        if (indent === 0) {
            const castedKey = key as keyof RawSchemas.DefinitionFileSchema;
            switch (castedKey) {
                case "docs":
                case "imports":
                case "types":
                case "service":
                case "errors":
                case "webhooks":
                case "channel":
                    return castedKey;
                default:
                    assertNeverNoThrow(castedKey);
                    return "unknown";
            }
        }

        if (previousLocation == null || previousLocation === "unknown") {
            return undefined;
        }

        switch (previousLocation) {
            case "docs":
            case "imports":
                return undefined;
            case "service":
            case "endpoint":
                if (indent === 2) {
                    return "endpoint";
                }
                return undefined;
            case "types":
            case "type":
                if (indent === 1) {
                    return "type";
                }
                return undefined;
            case "errors":
            case "error":
                if (indent === 1) {
                    return "error";
                }
                return undefined;
            case "webhooks":
            case "webhook":
                if (indent === 1) {
                    return "webhook";
                }
                return undefined;
            case "channel":
                if (indent === 1) {
                    return "channel";
                }
                return undefined;
            default:
                assertNever(previousLocation);
        }
    }
}

class LineReader {
    private lineIndex = 0;

    constructor(private readonly lines: string[]) {}

    public isEof() {
        return this.lines[this.lineIndex] == null;
    }

    public readNextLine(): string {
        const nextLine = this.lines[this.lineIndex++];
        if (nextLine == null) {
            throw new Error("EOF");
        }
        return nextLine;
    }
}

class FileWriter {
    private content = "";

    public write(content: string): void {
        this.content += content;
    }

    public writeLine(content?: string): void {
        if (content != null) {
            this.write(content);
        }
        this.write("\n");
    }

    public getContent(): string {
        return this.content;
    }
}
