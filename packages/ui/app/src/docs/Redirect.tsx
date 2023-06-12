import { useRouter } from "next/router";
import { useEffect } from "react";

export declare namespace Redirect {
    export interface Props {
        to: string;
        replace?: boolean;
    }
}

export const Redirect: React.FC<Redirect.Props> = ({ to, replace = false }) => {
    const router = useRouter();
    useEffect(() => {
        void (replace ? router.replace(to) : router.push(to));
    }, [replace, router, to]);
    return null;
};
