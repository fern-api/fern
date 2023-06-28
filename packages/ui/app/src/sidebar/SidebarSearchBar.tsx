import { Icon } from "@blueprintjs/core";
import { type MouseEventHandler } from "react";

export declare namespace SidebarSearchBar {
    export interface Props {
        onClick: MouseEventHandler<HTMLButtonElement>;
    }
}

export const SidebarSearchBar: React.FC<SidebarSearchBar.Props> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="border-border bg-gray-dark/50 hover:bg-gray-dark group flex items-center rounded-md border px-2 py-1.5 transition"
        >
            <div className="flex items-center space-x-2">
                <Icon className="text-text-muted group-hover:text-text-default transition" icon="search" size={14} />
                <div className="text-text-muted group-hover:text-text-default transition">Search</div>
            </div>

            <div className="text-text-muted group-hover:text-text-default ml-auto text-start text-xs tracking-wide transition">
                CMD+K
            </div>
        </button>
    );
};
