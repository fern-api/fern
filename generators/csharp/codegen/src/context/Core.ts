import { CSharp } from "../csharp";

export function createCore(csharp: CSharp, core: string) {
    return {
        FormRequest: csharp.classReference({
            name: "FormRequest",
            namespace: core
        })
    } as const;
}
