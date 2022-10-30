import { useEffect } from "react";

export declare namespace Redirect {
    export interface Props {
        to: string;
    }
}

export const Redirect: React.FC<Redirect.Props> = ({ to }) => {
    useEffect(() => {
        window.location.href = to;
    }, [to]);
    return null;
};
