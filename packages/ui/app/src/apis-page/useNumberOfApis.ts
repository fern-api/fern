import { Loadable, mapLoadable } from "@fern-api/loadable";
import { useMemo } from "react";
import { useAllApis } from "../queries/useAllApis";

export function useNumberOfApis(): Loadable<number> {
    const allApis = useAllApis();
    return useMemo(() => mapLoadable(allApis, (loaded) => loaded.apis.length), [allApis]);
}
