import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { assertNever } from "@fern-api/core-utils";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { useDocsContext } from "../docs-context/useDocsContext";
import { ResolvedUrlPath } from "../ResolvedUrlPath";

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
            case "markdown-page":
            case "mdx-page":
                return path.page.title;
            case "api":
            case "clientLibraries":
            case "apiSubpackage":
            case "endpoint":
            case "topLevelEndpoint":
                return path.apiSection.title;
            default:
                assertNever(path);
        }
    }, [path]);

    return (
        <Link
            className="!text-accentPrimary/80 hover:!text-accentPrimary flex cursor-pointer items-center gap-2 rounded !no-underline transition"
            onClick={onClick}
            href={`/${path.slug}`}
        >
            {visitDirection({
                previous: iconElement,
                next: null,
            })}
            <div className="font-medium">{text}</div>
            {visitDirection({
                previous: null,
                next: iconElement,
            })}
        </Link>
    );
};
