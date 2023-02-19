import { FernRegistry } from "@fern-fern/registry";
import React from "react";
import { ListPreviewPart } from "./ListPreviewPart";
import { MapPreviewPart } from "./MapPreviewPart";
import { OptionalPreviewPart } from "./OptionalPreviewPart";
import { ReferencedTypePreviewPart } from "./ReferencedTypePreviewPart";
import { SetPreviewPart } from "./SetPreviewPart";

export declare namespace TypePreviewPart {
    export interface Props {
        type: FernRegistry.Type;
        includeContainerItems: boolean;
    }
}

export const TypePreviewPart: React.FC<TypePreviewPart.Props> = ({ type, includeContainerItems }) => {
    return type._visit({
        primitive: (primitive) => (
            <span>
                {primitive._visit({
                    string: () => "string",
                    integer: () => "integer",
                    double: () => "double",
                    long: () => "long",
                    boolean: () => "boolean",
                    datetime: () => "ISO 8601 datetime",
                    uuid: () => "uuid",
                    _other: () => "unknown",
                })}
            </span>
        ),
        list: (list) => <ListPreviewPart list={list} includeContainerItems={includeContainerItems} />,
        reference: (typeId) => <ReferencedTypePreviewPart typeId={typeId} />,
        enum: () => <span>enum</span>,
        union: () => <span>union</span>,
        discriminatedUnion: () => <span>union</span>,
        object: () => <span>object</span>,
        optional: (optional) => (
            <OptionalPreviewPart optional={optional} includeContainerItems={includeContainerItems} />
        ),
        set: (set) => <SetPreviewPart set={set} includeContainerItems={includeContainerItems} />,
        map: (map) => <MapPreviewPart map={map} includeContainerItems={includeContainerItems} />,
        unknown: () => <span>any</span>,
        _other: () => <span>unknown</span>,
    });
};
