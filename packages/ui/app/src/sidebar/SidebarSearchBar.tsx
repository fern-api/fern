import { Icon } from "@blueprintjs/core";
import dynamic from "next/dynamic";
import { type MouseEventHandler } from "react";
import { platform } from "../utils/platform";

export declare namespace SidebarSearchBar {
    export interface Props {
        onClick: MouseEventHandler<HTMLButtonElement>;
    }
}

export const SidebarSearchBarCore: React.FC<SidebarSearchBar.Props> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="border-border bg-gray-dark/50 hover:bg-gray-dark group flex items-center rounded-md border px-2 py-1.5 transition"
        >
            <div className="flex items-center space-x-2">
                <Icon className="text-text-muted group-hover:text-text-default transition" icon="search" size={14} />
                <div className="text-text-muted group-hover:text-text-default transition">Search</div>
            </div>

            {platform !== "other" && (
                <div className="text-text-muted group-hover:text-text-default ml-auto text-start text-xs tracking-wide transition">
                    {platform === "mac" ? "CMD+K" : "CTRL+K"}
                </div>
            )}
        </button>
    );
};

export const SidebarSearchBar = dynamic(() => Promise.resolve(SidebarSearchBarCore), {
    ssr: false,
});
