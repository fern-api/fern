import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";

export function useGetToken({ audience }: { audience: string | undefined }): () => Promise<string | undefined> {
    const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();
    return useCallback(async () => {
        try {
            // need to await so the catch block catches the error
            return await getAccessTokenSilently({ authorizationParams: { audience } });
        } catch {
            return getAccessTokenWithPopup({ authorizationParams: { audience } });
        }
    }, [audience, getAccessTokenSilently, getAccessTokenWithPopup]);
}
