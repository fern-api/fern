import { getPathModule } from "./getPathModule";

export function sep(): string {
    return getPathModule().sep;
}
