import { SubpackageId } from "@fern-fern/ir-sdk";

export type PackageId = { isRoot: true } | { isRoot: false; subpackageId: SubpackageId };
