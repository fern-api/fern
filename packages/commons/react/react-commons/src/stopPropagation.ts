import { SyntheticEvent } from "react";

export const STOP_PROPAGATION = (event: SyntheticEvent): void => {
    event.stopPropagation();
};
