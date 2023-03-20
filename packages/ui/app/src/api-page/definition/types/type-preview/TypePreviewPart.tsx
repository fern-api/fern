import { FernRegistry } from "@fern-fern/registry";
import React from "react";
import { ListPreviewPart } from "./ListPreviewPart";
import { MapPreviewPart } from "./MapPreviewPart";
import { OptionalPreviewPart } from "./OptionalPreviewPart";
import { PrimitivePreviewPart } from "./PrimitivePreviewPart";
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
        primitive: (primitive) => <PrimitivePreviewPart primitive={primitive} />,
        list: (list) => <ListPreviewPart list={list} includeContainerItems={includeContainerItems} />,
        reference: (typeId) => <ReferencedTypePreviewPart typeId={typeId} />,
        enum: () => <div>enum</div>,
        union: () => <div>union</div>,
        discriminatedUnion: () => <div>union</div>,
        object: () => <div>object</div>,
        optional: (optional) => (
            <OptionalPreviewPart optional={optional} includeContainerItems={includeContainerItems} />
        ),
        set: (set) => <SetPreviewPart set={set} includeContainerItems={includeContainerItems} />,
        map: (map) => <MapPreviewPart map={map} includeContainerItems={includeContainerItems} />,
        unknown: () => <div>any</div>,
        _other: () => <div>unknown</div>,
    });
};
