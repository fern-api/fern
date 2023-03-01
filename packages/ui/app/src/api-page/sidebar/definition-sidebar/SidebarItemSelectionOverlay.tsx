import classNames from "classnames";

export declare namespace SidebarItemSelectionOverlay {
    export interface Props {
        className?: string;
    }
}

export const SidebarItemSelectionOverlay: React.FC<SidebarItemSelectionOverlay.Props> = ({ className }) => {
    return <div className={classNames("absolute top-0 right-0 bottom-0 -left-[1000px]", className)} />;
};
