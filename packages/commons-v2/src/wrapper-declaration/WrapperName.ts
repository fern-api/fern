import { FernFilepath } from "@fern-fern/ir-model/commons";

export interface WrapperName {
    name: string;
    isRootWrapper: boolean;
    fernFilepath: FernFilepath;
}
