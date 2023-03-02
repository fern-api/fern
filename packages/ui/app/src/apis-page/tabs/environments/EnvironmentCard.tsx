import { Loadable } from "@fern-api/loadable";
import { FernRegistry } from "@fern-fern/registry";

export declare namespace EnvironmentCard {
    export interface Props {
        environment: Loadable<FernRegistry.Environment>;
    }
}

export const EnvironmentCard: React.FC<EnvironmentCard.Props> = ({ environment }) => {
    return <div>{environment.type}</div>;
};
