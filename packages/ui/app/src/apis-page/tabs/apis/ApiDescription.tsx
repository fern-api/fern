import { EditableText } from "@blueprintjs/core";
import { useLocalTextState } from "@fern-api/react-commons";
import { FernRegistry } from "@fern-fern/registry";
import { useCallback } from "react";
import { useUpdateApiMetadata } from "../../../queries/useApiMetadata";

export declare namespace ApiDescription {
    export interface Props {
        apiMetadata: FernRegistry.ApiMetadata;
    }
}

export const ApiDescription: React.FC<ApiDescription.Props> = ({ apiMetadata }) => {
    const updateMetadata = useUpdateApiMetadata(apiMetadata.id);

    const onChangeDescription = useCallback(
        async (newDescription: string) => {
            await updateMetadata({
                description: newDescription,
            });
        },
        [updateMetadata]
    );

    const editableTextProps = useLocalTextState({
        persistedValue: apiMetadata.description ?? "",
        onRename: onChangeDescription,
    });

    return <EditableText className="text-gray-500" placeholder="Add description..." {...editableTextProps} multiline />;
};
