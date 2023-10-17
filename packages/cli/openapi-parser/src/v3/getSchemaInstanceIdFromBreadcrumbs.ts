import { SchemaInstanceId } from "@fern-fern/openapi-ir-model/example";

export function getSchemaInstanceIdFromBreadcrumbs(breadcrumbs: string[]): SchemaInstanceId {
    return breadcrumbs.join("_");
}
