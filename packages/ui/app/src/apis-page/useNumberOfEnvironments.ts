import { Loadable, mapLoadable } from "@fern-api/loadable";
import { useMemo } from "react";
import { useAllEnvironments } from "../queries/useAllEnvironments";

export function useNumberOfEnvironments(): Loadable<number> {
    const allEnvironments = useAllEnvironments();
    return useMemo(() => mapLoadable(allEnvironments, (loaded) => loaded.environments.length), [allEnvironments]);
}
