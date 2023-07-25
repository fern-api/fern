import { Menu, Transition } from "@headlessui/react";
import classNames from "classnames";
import { Fragment } from "react";
import { CheckIcon } from "../commons/icons/CheckIcon";
import { ChevronDownIcon } from "../commons/icons/ChevronDownIcon";

export declare namespace HeaderVersionMenu {
    export interface Props {
        versions: string[];
        selectedIndex: number | undefined;
    }
}

export const HeaderVersionMenu: React.FC<HeaderVersionMenu.Props> = ({ versions, selectedIndex }) => {
    const selectedVersion = selectedIndex == null ? undefined : versions[selectedIndex];

    return (
        <div className="flex w-32">
            <Menu as="div" className="relative inline-block text-left">
                <div className="my-auto">
                    <Menu.Button className="border-border bg-gray-dark/50 hover:bg-gray-dark text-text-muted hover:text-text-default group inline-flex w-full justify-center space-x-1.5 rounded-full border py-1.5 pl-3 pr-1.5 text-xs">
                        {({ open }) => {
                            return (
                                <>
                                    <span className="transition-colors">{selectedVersion}</span>
                                    <ChevronDownIcon
                                        className={classNames("h-4 w-4 transition", {
                                            "rotate-180": open,
                                        })}
                                    />
                                </>
                            );
                        }}
                    </Menu.Button>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="border-border-concealed absolute left-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md border shadow-lg">
                        <div>
                            {versions.map((version, idx) => (
                                <Menu.Item key={idx}>
                                    {({ active }) => (
                                        <button
                                            className={classNames(
                                                "flex w-full justify-between items-center text-xs p-2",
                                                {
                                                    "bg-neutral-900": active,
                                                    "bg-neutral-950": !active,
                                                    "text-accentPrimary": idx === selectedIndex,
                                                    "text-text-muted": idx !== selectedIndex,
                                                    "rounded-t-md": idx === 0,
                                                    "rounded-b-md": idx === versions.length - 1,
                                                }
                                            )}
                                        >
                                            <span>{version}</span>
                                            <CheckIcon
                                                className={classNames("h-3 w-3", {
                                                    visible: idx === selectedIndex,
                                                    invisible: idx !== selectedIndex,
                                                })}
                                            />
                                        </button>
                                    )}
                                </Menu.Item>
                            ))}
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
};
