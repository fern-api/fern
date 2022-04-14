import { TypeReference } from "./TypeReference";
import { WithDocs } from "./WithDocs";

export interface HttpError extends WithDocs {
    name: string;
    statusCode: number;
    bodyType: TypeReference | null | undefined;
}
