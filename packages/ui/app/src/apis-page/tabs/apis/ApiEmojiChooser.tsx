import { Popover2 } from "@blueprintjs/popover2";
import { FernRegistry } from "@fern-fern/registry";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useCallback, useMemo, useState } from "react";
import { useUpdateApiMetadata } from "../../../queries/useApiMetadata";
import { ApiEmoji } from "./ApiEmoji";

export declare namespace ApiEmojiChooser {
    export interface Props {
        apiMetadata: FernRegistry.ApiMetadata;
    }
}

export const ApiEmojiChooser: React.FC<ApiEmojiChooser.Props> = ({ apiMetadata }) => {
    const emoji = useMemo(() => {
        if (apiMetadata.image == null) {
            return undefined;
        }
        return apiMetadata.image._visit({
            emoji: (emoji) => emoji,
            url: () => undefined,
            _other: () => undefined,
        });
    }, [apiMetadata.image]);

    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const updateMetadata = useUpdateApiMetadata(apiMetadata.id);

    const onSelectEmoji = useCallback(
        async (data: EmojiClickData) => {
            setIsPopoverOpen(false);
            await updateMetadata({
                image: FernRegistry.ApiImage.emoji(data.emoji),
            });
        },
        [updateMetadata]
    );

    return (
        <Popover2
            isOpen={isPopoverOpen}
            onInteraction={setIsPopoverOpen}
            content={<EmojiPicker onEmojiClick={onSelectEmoji} />}
        >
            <ApiEmoji className="cursor-pointer" emoji={emoji ?? "😃"} />
        </Popover2>
    );
};
