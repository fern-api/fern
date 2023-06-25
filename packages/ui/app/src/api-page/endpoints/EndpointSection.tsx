import { Description } from "../types/Description";

export declare namespace EndpointSection {
    export type Props = React.PropsWithChildren<{
        title: string;
        htmlDescription?: string;
    }>;
}

export const EndpointSection: React.FC<EndpointSection.Props> = ({ title, htmlDescription, children }) => {
    return (
        <div className="flex flex-col">
            <div className="mb-3 flex items-center gap-3">
                <div className="text-lg font-medium">{title}</div>
            </div>
            <Description className="mb-2" htmlDescription={htmlDescription} />
            <div className="flex flex-col">{children}</div>
        </div>
    );
};
