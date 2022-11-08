import { FernApiEditor } from "@fern-fern/api-editor-sdk";
import React from "react";
import { useApiEditorContext } from "../../../../../api-editor-context/ApiEditorContext";
import { NothingSelectedPage } from "../../../../NothingSelectedPage";
import { TypePage } from "./TypePage";

export declare namespace MaybeExistingTypePage {
    export interface Props {
        typeId: FernApiEditor.TypeId;
    }
}

export const MaybeExistingTypePage: React.FC<MaybeExistingTypePage.Props> = ({ typeId }) => {
    const {
        definition: {
            types: { [typeId]: type },
        },
    } = useApiEditorContext();

    if (type == null) {
        return <NothingSelectedPage />;
    }

    return <TypePage type={type} />;
};
