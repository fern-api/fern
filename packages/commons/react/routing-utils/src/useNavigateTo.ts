import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function useNavigateTo(path: string): () => void {
    const navigate = useNavigate();
    return useCallback(() => {
        navigate(path);
    }, [navigate, path]);
}
