import { StringWithAllCasings, WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import { Language } from "../language";
import { generateNameCasings } from "./generateNameCasings";
import { generateWireCasings } from "./generateWireCasings";

export interface CasingsGenerator {
    generateNameCasings(name: string): StringWithAllCasings;
    generateWireCasings(args: { name: string; wireValue: string }): WireStringWithAllCasings;
}

export function constructCasingsGenerator(generationLanguage: Language | undefined): CasingsGenerator {
    return {
        generateNameCasings: (name) => generateNameCasings({ name, generationLanguage }),
        generateWireCasings: ({ name, wireValue }) => generateWireCasings({ name, wireValue, generationLanguage }),
    };
}
