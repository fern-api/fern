import { GeneratedVersion } from "@fern-typescript/contexts";

import { ApiVersionScheme } from "@fern-fern/ir-sdk/api";

import { GeneratedVersionImpl } from "./GeneratedVersionImpl";

export declare namespace VersionGenerator {
    export namespace generateVersion {
        export interface Args {
            apiVersion: ApiVersionScheme;
            versionEnumName: string;
            firstEnumValue: string;
        }
    }
}

export class VersionGenerator {
    public generateVersion({
        apiVersion,
        versionEnumName,
        firstEnumValue
    }: VersionGenerator.generateVersion.Args): GeneratedVersion {
        return new GeneratedVersionImpl({
            apiVersion,
            versionEnumName,
            firstEnumValue
        });
    }
}
