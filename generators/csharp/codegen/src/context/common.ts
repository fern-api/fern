import { FernIr } from "@fern-fern/ir-sdk";

type TypeId = FernIr.TypeId;
type FernFilepath = FernIr.FernFilepath;

export type TRelativeFilePath = string & {
    __RelativeFilePath: void;
};
export type TAbsoluteFilePath = string & {
    __AbsoluteFilePath: void;
};
export interface Support {
    makeRelativeFilePath: (path: string) => TRelativeFilePath;
    makeAbsoluteFilePath: (path: string) => TAbsoluteFilePath;
    getNamespaceForTypeId: (typeId: TypeId) => string;
    getDirectoryForTypeId: (typeId: TypeId) => string;
    getCoreAsIsFiles: () => string[];
    getCoreTestAsIsFiles: () => string[];
    getPublicCoreAsIsFiles: () => string[];
    getAsyncCoreAsIsFiles: () => string[];
    getChildNamespaceSegments(fernFilepath: FernFilepath): string[];
}

export type MinimalGeneratorConfig = {
    dryRun: boolean;
    irFilepath: string;
    originalReadmeFilepath?: string;
    organization: string;
    workspaceName: string;
};
