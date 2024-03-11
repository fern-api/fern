import { QueryParameterRepresentation } from "@fern-api/ir-sdk";

type EncodingType = "exploded" | "comma_delimited" | "space_delimited" | "pipe_delimited";

export function convertQueryParameterRepresentation(encoding?: EncodingType): QueryParameterRepresentation {
    switch (encoding) {
        case "exploded":
            return QueryParameterRepresentation.Exploded;
        case "comma_delimited":
            return QueryParameterRepresentation.CommaDelimited;
        case "space_delimited":
            return QueryParameterRepresentation.SpaceDelimited;
        case "pipe_delimited":
            return QueryParameterRepresentation.PipeDelimited;
        default:
            return QueryParameterRepresentation.Exploded;
    }
}
