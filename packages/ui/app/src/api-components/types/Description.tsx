import { Markdown } from "../markdown/Markdown";

export declare namespace Description {
    export interface Props {
        description?: string | undefined;
    }
}

export const Description: React.FC<Description.Props> = ({ description }) => {
    if (description == null) {
        return null;
    }

    return <Markdown className="prose-p:text-[#A7A7B0] mt-3">{description}</Markdown>;
};
