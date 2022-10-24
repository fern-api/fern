import { Name, NameAndWireValue, StringWithAllCasings, WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import { Language } from "../language";
import { generateNameCasings } from "./generateNameCasings";
import { generateWireCasings } from "./generateWireCasings";

export interface CasingsGenerator {
    generateNameCasingsV1(name: string): StringWithAllCasings;
    generateWireCasingsV1(args: { name: string; wireValue: string }): WireStringWithAllCasings;
    generateName(name: string): Name;
    generateNameAndWireValue(args: { name: string; wireValue: string }): NameAndWireValue;
}

export function constructCasingsGenerator(generationLanguage: Language | undefined): CasingsGenerator {
    const casingsGenerator: CasingsGenerator = {
        generateNameCasingsV1: (name) => generateNameCasings({ name, generationLanguage: undefined }),
        generateWireCasingsV1: ({ name, wireValue }) =>
            generateWireCasings({ name, wireValue, generationLanguage: undefined }),
        generateName: (name) => ({
            unsafeName: generateNameCasings({ name, generationLanguage: undefined }),
            safeName: generateNameCasings({ name, generationLanguage }),
        }),
        generateNameAndWireValue: ({ name, wireValue }) => ({
            name: casingsGenerator.generateName(name),
            wireValue,
        }),
    };
    return casingsGenerator;
}
