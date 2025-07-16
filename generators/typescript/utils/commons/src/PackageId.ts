import { SubpackageId } from '@fern-fern/ir-sdk/api'

export type PackageId = { isRoot: true } | { isRoot: false; subpackageId: SubpackageId }
