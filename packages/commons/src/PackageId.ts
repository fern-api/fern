import { SubpackageId } from "@fern-fern/ir-model/commons";

export type PackageId = { isRoot: true } | { isRoot: false; subpackageId: SubpackageId };
