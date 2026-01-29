import { SubpackageId } from "@fern-api/ir-sdk";

export type PackageId = { isRoot: true } | { isRoot: false; subpackageId: SubpackageId };
