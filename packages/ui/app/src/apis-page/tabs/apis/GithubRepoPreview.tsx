import { Icon, Text } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { STOP_PROPAGATION, useIsHovering } from "@fern-api/react-commons";
import classNames from "classnames";
import { FaGithub } from "react-icons/fa";

export declare namespace GithubRepoPreview {
    export interface Props {
        className?: string;
    }
}

export const GithubRepoPreview: React.FC<GithubRepoPreview.Props> = ({ className }) => {
    const { isHovering, ...containerProps } = useIsHovering();

    return (
        <div
            {...containerProps}
            className={classNames(
                className,
                "flex items-center py-2 cursor-pointer hover:underline underline-offset-2"
            )}
            onClick={STOP_PROPAGATION}
        >
            <FaGithub className="mr-1 flex-shrink-0" size={16} />
            <Text ellipsize className="font-bold text-xs">
                {"<placeholder github repo link>"}
            </Text>
            {isHovering && <Icon className="ml-1" size={12} icon={IconNames.ARROW_TOP_RIGHT} />}
        </div>
    );
};
