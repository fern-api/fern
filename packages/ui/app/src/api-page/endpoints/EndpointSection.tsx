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
            <div className="mb-3 flex items-center gap-3">
                <div className="text-lg font-semibold">{title}</div>
                {titleRightText != null && (
                    <div className="text-xs text-gray-400">
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
