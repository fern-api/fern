import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { assertNever } from "@fern-api/core-utils";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { ResolvedUrlPath } from "../docs-context/url-path-resolver/UrlPathResolver";
import { useDocsContext } from "../docs-context/useDocsContext";

export declare namespace BottomNavigationButton {
    export interface Props {
        path: ResolvedUrlPath;
        direction: "previous" | "next";
    }
}

export const BottomNavigationButton: React.FC<BottomNavigationButton.Props> = ({ path, direction }) => {
    const { navigateToPath } = useDocsContext();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
    const visitDirection = <T extends unknown>({ previous, next }: { previous: T; next: T }): T => {
        switch (direction) {
            case "previous":
                return previous;
            case "next":
                return next;
            default:
                assertNever(direction);
        }
    };

    const iconName = visitDirection({
        previous: IconNames.CHEVRON_LEFT,
        next: IconNames.CHEVRON_RIGHT,
    });
    const iconElement = <Icon icon={iconName} />;

    const onClick = useCallback(() => {
        navigateToPath(path.slug);
    }, [navigateToPath, path.slug]);

    const text = useMemo(() => {
        switch (path.type) {
            case "section":
                return path.section.title;
            case "page":
                return path.page.title;
            case "api":
            case "apiSubpackage":
            case "endpoint":
            case "topLevelEndpoint":
                return path.apiSection.title;
            default:
                assertNever(path);
        }
    }, [path]);

    return (
        <div
            className={classNames(
                "flex items-center text-[#969CEE] py-2 rounded gap-2 hover:bg-accentHighlight cursor-pointer",
                visitDirection({
                    previous: "pl-3 pr-4",
                    next: "pl-4 pr-3",
                })
            )}
            onClick={onClick}
        >
            {visitDirection({
                previous: iconElement,
                next: null,
            })}
            <div className="font-semibold">{text}</div>
            {visitDirection({
                previous: null,
                next: iconElement,
            })}
        </div>
    );
};
