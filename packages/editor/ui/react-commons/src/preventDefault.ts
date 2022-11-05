import { SyntheticEvent } from "react";

export const PREVENT_DEFAULT = (event: SyntheticEvent): void => {
    event.preventDefault();
};
