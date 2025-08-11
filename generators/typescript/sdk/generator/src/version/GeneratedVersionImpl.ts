import { getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedVersion, SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { ApiVersionScheme, HttpHeader } from "@fern-fern/ir-sdk/api";

export class GeneratedVersionImpl implements GeneratedVersion {
    private apiVersion: ApiVersionScheme;
    private versionEnumName: string;
    private firstEnumValue: string;

    constructor({
        apiVersion,
        versionEnumName,
        firstEnumValue
    }: {
        apiVersion: ApiVersionScheme;
        versionEnumName: string;
        firstEnumValue: string;
    }) {
        this.apiVersion = apiVersion;
        this.versionEnumName = versionEnumName;
        this.firstEnumValue = firstEnumValue;
    }

    public writeToFile(context: SdkContext): void {
        context.sourceFile.addTypeAlias({
            docs: [`The version of the API, sent as the ${this.apiVersion.header.name.wireValue} header.`],
            name: this.versionEnumName,
            isExported: true,
            type: this.getEnumValueUnion()
        });
    }

    public getEnumValueUnion(): string {
        const enumValues = this.apiVersion.value.values.map((version) =>
            ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(version.name.wireValue))
        );
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
        return this.apiVersion.value.default.name.wireValue;
    }

    public getHeader(): HttpHeader {
        return this.apiVersion.header;
    }
}
