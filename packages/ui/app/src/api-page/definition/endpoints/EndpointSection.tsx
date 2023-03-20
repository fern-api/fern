import { H4 } from "@blueprintjs/core";
import { Markdown } from "../markdown/Markdown";

export declare namespace EndpointSection {
    export type Props = React.PropsWithChildren<{
        title: string;
        docs?: string;
    }>;
}

export const EndpointSection: React.FC<EndpointSection.Props> = ({ title, docs, children }) => {
    return (
        <div className="flex flex-col">
            <H4>{title}</H4>
            {docs != null && (
                <div className="mb-2">
                    <Markdown docs={docs} />
                </div>
            )}
            <div className="flex flex-col">{children}</div>
        </div>
    );
};
