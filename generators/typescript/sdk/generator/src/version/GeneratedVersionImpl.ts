import { getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { FileContext, GeneratedVersion } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export class GeneratedVersionImpl implements GeneratedVersion {
    private apiVersion: FernIr.ApiVersionScheme;
    private versionEnumName: string;
    private firstEnumValue: string;

    constructor({
        apiVersion,
        versionEnumName,
        firstEnumValue
    }: {
        apiVersion: FernIr.ApiVersionScheme;
        versionEnumName: string;
        firstEnumValue: string;
    }) {
        this.apiVersion = apiVersion;
        this.versionEnumName = versionEnumName;
        this.firstEnumValue = firstEnumValue;
    }

    public writeToFile(context: FileContext): void {
        context.sourceFile.addTypeAlias({
            docs: [`The version of the API, sent as the ${getWireValue(this.apiVersion.header.name)} header.`],
            name: this.versionEnumName,
            isExported: true,
            type: this.getEnumValueUnion()
        });
    }

    public getEnumValueUnion(): string {
        const enumValues = this.apiVersion.value.values.map((version) => {
            const wireValue = getWireValue(version.name);
            return ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(wireValue));
        });
        return getTextOfTsNode(ts.factory.createUnionTypeNode(enumValues));
    }

    public getFirstEnumValue(): string {
        return this.firstEnumValue;
    }

    public hasDefaultVersion(): boolean {
        return this.apiVersion.value.default != null;
    }

    public getDefaultVersion(): string | undefined {
        if (this.apiVersion.value.default == null) {
            return undefined;
        }
        const defaultName = this.apiVersion.value.default.name;
        return getWireValue(defaultName);
    }

    public getHeader(): FernIr.HttpHeader {
        return this.apiVersion.header;
    }
}
