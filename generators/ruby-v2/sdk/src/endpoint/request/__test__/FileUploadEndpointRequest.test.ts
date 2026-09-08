import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { renderFileUploadStatement } from "../FileUploadEndpointRequest.js";

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

describe("renderFileUploadStatement", () => {
    it("adds a single file via FormData#add_file", () => {
        const statement = renderFileUploadStatement({
            property: FernIr.FileProperty.file({
                key: key("users"),
                isOptional: false,
                contentType: undefined,
                docs: undefined
            }),
            paramName: "users"
        });
        expect(statement).toBe('body.add_file(name: "users", file: params[:users]) if params[:users]');
        expect(statement).not.toContain("to_form_data_part");
    });

    it("adds one part per element for a file array using safe navigation", () => {
        const statement = renderFileUploadStatement({
            property: FernIr.FileProperty.fileArray({
                key: key("fileList"),
                isOptional: true,
                contentType: undefined,
                docs: undefined
            }),
            paramName: "file_list"
        });
        expect(statement).toBe('params[:file_list]&.each { |file| body.add_file(name: "fileList", file: file) }');
    });

    it("forwards the declared content type", () => {
        expect(
            renderFileUploadStatement({
                property: FernIr.FileProperty.file({
                    key: key("file"),
                    isOptional: false,
                    contentType: "application/octet-stream",
                    docs: undefined
                }),
                paramName: "file"
            })
        ).toBe(
            'body.add_file(name: "file", file: params[:file], content_type: "application/octet-stream") if params[:file]'
        );
        expect(
            renderFileUploadStatement({
                property: FernIr.FileProperty.fileArray({
                    key: key("files"),
                    isOptional: false,
                    contentType: "image/png",
                    docs: undefined
                }),
                paramName: "files"
            })
        ).toBe('params[:files]&.each { |file| body.add_file(name: "files", file: file, content_type: "image/png") }');
    });
});
