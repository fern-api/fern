import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import { Language } from "../language";
import { generateNameCasings } from "./generateNameCasings";

export function generateWireCasings({
    name,
    wireValue,
    generationLanguage,
}: {
    name: string;
    wireValue: string;
    generationLanguage: Language | undefined;
}): WireStringWithAllCasings {
    return {
        ...generateNameCasings({ name, generationLanguage }),
        wireValue,
    };
}
