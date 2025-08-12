import { Visibility } from "../types";
import { Writer } from "../Writer";

export function writeVisibility(writer: Writer, visibility: Visibility): void {
    switch (visibility.type) {
        case "public":
            writer.write("pub");
            break;
        case "pub_crate":
            writer.write("pub(crate)");
            break;
        case "pub_super":
            writer.write("pub(super)");
            break;
        case "private":
            // Don't write anything for private
            break;
    }
}
