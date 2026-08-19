import { Writer } from "../core/Writer.js";
import { Type } from "../Type.js";

export function writeGenerics({ writer, generics }: { writer: Writer; generics: Type[] }): void {
    if (generics.length === 0) {
        return;
    }
    writer.write("[");
    generics.forEach((generic, idx) => {
        if (idx > 0) {
            writer.write(", ");
        }
        if (generic != null) {
            writer.writeNode(generic);
        }
    });
    writer.write("]");
}
