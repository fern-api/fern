import { Classes } from "@blueprintjs/core";
import { useNavigateTo } from "@fern-api/routing-utils";
import classNames from "classnames";
import { FernLogo } from "../FernLogo";
import { FernRoutes } from "../routes";

export declare namespace Header {
    export interface Props {
        centerContent?: JSX.Element;
    }
}

export const Header: React.FC<Header.Props> = ({ centerContent }) => {
    const goHome = useNavigateTo(FernRoutes.HOME.absolutePath);

    return (
        <div className={classNames("flex text-white bg-zinc-900 p-2", Classes.DARK)}>
            <div className="flex flex-1 items-center gap-2 cursor-pointer" onClick={goHome}>
                <FernLogo size={30} />
                <div className="text-xl">Fern</div>
            </div>
            <div className="flex flex-1 justify-center items-center">{centerContent}</div>
            <div className="flex flex-1" />
        </div>
    );
};
