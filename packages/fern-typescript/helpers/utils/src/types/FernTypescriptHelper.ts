import { Encoder, Encoding } from "./Encoder";

export interface FernTypescriptHelper {
    encodings?: Record<Encoding, Encoder>;
}
