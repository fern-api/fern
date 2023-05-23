import { MonospaceText } from "../../commons/monospace/MonospaceText";
import { Markdown } from "../markdown/Markdown";

export declare namespace EndpointSection {
    export type Props = React.PropsWithChildren<{
        title: string;
        titleRightText?: JSX.Element | string;
        description?: string;
    }>;
}

export const EndpointSection: React.FC<EndpointSection.Props> = ({ title, titleRightText, description, children }) => {
    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-3">
                <div className="text-lg">{title}</div>
                {titleRightText != null && (
                    <div className="text-gray-400 text-xs">
                        <MonospaceText>{titleRightText}</MonospaceText>
                    </div>
                )}
            </div>
            {description != null && (
                <div className="mb-2">
                    <Markdown>{description}</Markdown>
                </div>
            )}
            <div className="flex flex-col">{children}</div>
        </div>
    );
};
