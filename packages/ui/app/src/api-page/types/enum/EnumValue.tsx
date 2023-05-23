import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import { MonospaceText } from "../../../commons/monospace/MonospaceText";
import { useTypeDefinitionContext } from "../context/TypeDefinitionContext";
import { Description } from "../Description";

export declare namespace EnumValue {
    export interface Props {
        enumValue: FernRegistryApiRead.EnumValue;
    }
}

export const EnumValue: React.FC<EnumValue.Props> = ({ enumValue }) => {
    const { isRootTypeDefinition } = useTypeDefinitionContext();

    return (
        <div
            className={classNames("flex flex-col py-4", {
                "px-2": !isRootTypeDefinition,
            })}
        >
            <MonospaceText>{`"${enumValue.value}"`}</MonospaceText>
            <Description description={enumValue.description} />
        </div>
    );
};
