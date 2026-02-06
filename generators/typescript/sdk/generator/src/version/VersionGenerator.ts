import { FernIr } from "@fern-fern/ir-sdk";
import { GeneratedVersion } from "@fern-typescript/contexts";

import { GeneratedVersionImpl } from "./GeneratedVersionImpl.js";

export declare namespace VersionGenerator {
    export namespace generateVersion {
        export interface Args {
            apiVersion: FernIr.ApiVersionScheme;
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
