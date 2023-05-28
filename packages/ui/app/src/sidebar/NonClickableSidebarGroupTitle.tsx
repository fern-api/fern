import classNames from "classnames";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace NonClickableSidebarGroupTitle {
    export interface Props {
        title: string;
    }
}

export const NonClickableSidebarGroupTitle: React.FC<NonClickableSidebarGroupTitle.Props> = ({ title }) => {
    return (
        <SidebarItemLayout
            title={
                <div className={classNames("uppercase font-medium tracking-wide", "text-white", "dark:text-white")}>
                    {title}
                </div>
            }
        />
    );
};
