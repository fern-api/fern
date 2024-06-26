/**
 * This file was auto-generated by Fern from our API Definition.
 */

import * as serializers from "../../..";
import * as FernDocsConfig from "../../../../api";
import * as core from "../../../../core";

export const NavigationItem: core.serialization.Schema<serializers.NavigationItem.Raw, FernDocsConfig.NavigationItem> =
    core.serialization.undiscriminatedUnion([
        core.serialization.lazyObject(async () => (await import("../../..")).PageConfiguration),
        core.serialization.lazyObject(async () => (await import("../../..")).SectionConfiguration),
        core.serialization.lazyObject(async () => (await import("../../..")).ApiReferenceConfiguration),
        core.serialization.lazyObject(async () => (await import("../../..")).LinkConfiguration),
        core.serialization.lazyObject(async () => (await import("../../..")).ChangelogConfiguration),
    ]);

export declare namespace NavigationItem {
    type Raw =
        | serializers.PageConfiguration.Raw
        | serializers.SectionConfiguration.Raw
        | serializers.ApiReferenceConfiguration.Raw
        | serializers.LinkConfiguration.Raw
        | serializers.ChangelogConfiguration.Raw;
}
