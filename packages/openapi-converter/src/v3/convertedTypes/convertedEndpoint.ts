import { ConvertedHeader } from "./convertedHeader";

export interface ConvertedEndpoint {
    path: string;
    method: string;
    headers: ConvertedHeader[];
}
