import { PropsWithChildren } from "react";
import { ResolvedUrlPath } from "../../api-context/url-path-resolver/UrlPathResolver";
import { ClickableSidebarItem } from "./ClickableSidebarItem";

export declare namespace SidebarSection {
    export type Props = PropsWithChildren<{
        title: JSX.Element | string;
        path: string;
        resolvedUrlPath: ResolvedUrlPath;
        isSelected: boolean;
    }>;
}

export const SidebarSection: React.FC<SidebarSection.Props> = ({
    title,
    path,
    resolvedUrlPath,
    isSelected,
    children,
}) => {
    return (
        <div className="flex flex-col">
            <ClickableSidebarItem title={title} path={path} isSelected={isSelected} resolvedUrlPath={resolvedUrlPath} />
            <div className="flex">
                <div className="flex flex-1 flex-col min-w-0">{children}</div>
            </div>
        </div>
    );
};
