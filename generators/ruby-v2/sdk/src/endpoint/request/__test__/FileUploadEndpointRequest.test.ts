import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { buildFileUploadStatement } from "../FileUploadEndpointRequest.js";

function key(name: string): FernIr.NameAndWireValue {
    return {
        wireValue: name,
        name: {
            originalName: name,
            camelCase: { unsafeName: name, safeName: name },
            snakeCase: { unsafeName: name, safeName: name },
            screamingSnakeCase: { unsafeName: name, safeName: name },
            pascalCase: { unsafeName: name, safeName: name }
        }
    };
}

function render(args: Parameters<typeof buildFileUploadStatement>[0]): string {
    return buildFileUploadStatement(args).toString().trimEnd();
}

describe("buildFileUploadStatement", () => {
    it("adds a single file via FormData#add_file", () => {
        const statement = render({
            property: FernIr.FileProperty.file({
                key: key("users"),
                isOptional: false,
                contentType: undefined,
                docs: undefined
            }),
            paramName: "users"
        });
        expect(statement).toBe(
            [
                "if params[:users]",
                "  body.add_file(",
                '    name: "users",',
                "    file: params[:users]",
                "  )",
                "end"
            ].join("\n")
        );
        expect(statement).not.toContain("to_form_data_part");
    });

    it("adds one part per element for a file array", () => {
        const statement = render({
            property: FernIr.FileProperty.fileArray({
                key: key("fileList"),
                isOptional: true,
                contentType: undefined,
                docs: undefined
            }),
            paramName: "file_list"
        });
        expect(statement).toBe(
            [
                "params[:file_list]&.each do |file|",
                "  body.add_file(",
                '    name: "fileList",',
                "    file: file",
                "  )",
                "end"
            ].join("\n")
        );
    });

    it("forwards the declared content type", () => {
        expect(
            render({
                property: FernIr.FileProperty.file({
                    key: key("file"),
                    isOptional: false,
                    contentType: "application/octet-stream",
                    docs: undefined
                }),
                paramName: "file"
            })
        ).toBe(
            [
                "if params[:file]",
                "  body.add_file(",
                '    name: "file",',
                "    file: params[:file],",
                '    content_type: "application/octet-stream"',
                "  )",
                "end"
            ].join("\n")
        );
        expect(
            render({
                property: FernIr.FileProperty.fileArray({
                    key: key("files"),
                    isOptional: false,
                    contentType: "image/png",
                    docs: undefined
                }),
                paramName: "files"
            })
        ).toContain('content_type: "image/png"');
    });

    it("escapes wire names so schema-controlled strings cannot interpolate into generated Ruby", () => {
        expect(
            render({
                property: FernIr.FileProperty.file({
                    key: key('a"b#{`id`}'),
                    isOptional: false,
                    contentType: undefined,
                    docs: undefined
                }),
                paramName: "file"
            })
        ).toContain('name: "a\\"b\\#{`id`}",');
    });
});
