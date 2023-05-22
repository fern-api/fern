import { Classes } from "@blueprintjs/core";
import classNames from "classnames";
import { FernLogo } from "../FernLogo";

export declare namespace Header {
    export interface Props {
        centerContent?: JSX.Element;
    }
}

export const Header: React.FC<Header.Props> = ({ centerContent }) => {
    return (
        <div className={classNames("flex text-white bg-[#131615] p-2", Classes.DARK)}>
            <div className="flex flex-1 items-center gap-2">
                <div className="cursor-pointer">
                    <FernLogo size={30} />
                </div>
            </div>
            <div className="flex flex-1 justify-center items-center text-lg">{centerContent}</div>
        </div>
    );
};
