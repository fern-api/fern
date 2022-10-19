import { Language } from "../language";

export const RESERVED_KEYWORDS: Record<Language, Set<string>> = {
    [Language.TYPESCRIPT]: new Set(["delete"]),
    [Language.JAVA]: new Set(),
    [Language.PYTHON]: new Set(),
};
