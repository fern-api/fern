import { H4 } from "@blueprintjs/core";
import { Markdown } from "../markdown/Markdown";

export declare namespace EndpointSection {
    export type Props = React.PropsWithChildren<{
        title: string;
        description?: string;
    }>;
}

export const EndpointSection: React.FC<EndpointSection.Props> = ({ title, description, children }) => {
    return (
        <div className="flex flex-col">
            <H4>{title}</H4>
            {description != null && (
                <div className="mb-2">
                    <Markdown>{description}</Markdown>
                </div>
            )}
            <div className="flex flex-col">{children}</div>
        </div>
    );
};
