import { WithDocs } from "../commons/WithDocs";

export interface EnumValue extends WithDocs {
    /** Name must start with an alphabet. */
    name: string;
    value: string;
}
