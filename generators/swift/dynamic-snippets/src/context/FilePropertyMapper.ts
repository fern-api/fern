import { CaseConverter, getWireValue } from "@fern-api/base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { sanitizeSelf, swift } from "@fern-api/swift-codegen";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext.js";

const caseConverter = new CaseConverter({ generationLanguage: "swift", keywords: undefined, smartCasing: true });

export interface FilePropertyInfo {
    fileFields: swift.FunctionArgument[];
    bodyPropertyFields: swift.FunctionArgument[];
}

export class FilePropertyMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public getFilePropertyInfo({
        fromSymbol,
        body,
        value
    }: {
        fromSymbol: swift.Symbol;
        body: FernIr.dynamic.FileUploadRequestBody;
        value: unknown;
    }): FilePropertyInfo {
        const result: FilePropertyInfo = {
            fileFields: [],
            bodyPropertyFields: []
        };
        const record = this.context.getRecord(value) ?? {};
        for (const property of body.properties) {
            switch (property.type) {
                case "file": {
                    const arg = swift.functionArgument({
                        label: sanitizeSelf(caseConverter.camelUnsafe(property.name)),
                        value: this.getSingleFileProperty({ property, record })
                    });
                    result.fileFields.push(arg);
                    break;
                }
                case "fileArray": {
                    const arg = swift.functionArgument({
                        label: sanitizeSelf(caseConverter.camelUnsafe(property.name)),
                        value: this.getArrayFileProperty({ property, record })
                    });
                    result.fileFields.push(arg);
                    break;
                }
                case "bodyProperty": {
                    const arg = swift.functionArgument({
                        label: sanitizeSelf(caseConverter.camelUnsafe(property.name.name)),
                        value: this.getBodyProperty({ fromSymbol, property, record })
                    });
                    result.bodyPropertyFields.push(arg);
                    break;
                }
                default:
                    assertNever(property);
            }
        }
        return result;
    }

    private getSingleFileProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.FileUploadRequestBodyProperty.File_;
        record: Record<string, unknown>;
    }): swift.Expression {
        const fileValue = this.context.getSingleFileValue({ property, record });
        return swift.Expression.contextualMethodCall({
            methodName: "init",
            arguments_: [
                swift.functionArgument({
                    label: "data",
                    value: swift.Expression.dataLiteral(fileValue ?? "")
                })
            ]
        });
    }

    private getArrayFileProperty({
        property,
        record
    }: {
        property: FernIr.dynamic.FileUploadRequestBodyProperty.FileArray;
        record: Record<string, unknown>;
    }): swift.Expression {
        const fileValues = this.context.getFileArrayValues({ property, record });
        return swift.Expression.arrayLiteral({
            elements: (fileValues ?? []).map((value) =>
                swift.Expression.contextualMethodCall({
                    methodName: "init",
                    arguments_: [
                        swift.functionArgument({
                            label: "data",
                            value: swift.Expression.dataLiteral(value)
                        })
                    ]
                })
            ),
            multiline: true
        });
    }

    private getBodyProperty({
        fromSymbol,
        property,
        record
    }: {
        fromSymbol: swift.Symbol;
        property: FernIr.dynamic.NamedParameter;
        record: Record<string, unknown>;
    }): swift.Expression {
        const bodyPropertyValue = record[getWireValue(property.name)];
        if (bodyPropertyValue == null) {
            return swift.Expression.nop();
        }
        return this.context.dynamicTypeLiteralMapper.convert({
            fromSymbol,
            typeReference: property.typeReference,
            value: bodyPropertyValue
        });
    }
}
