import { go } from "@fern-api/go-ast";

export interface PaginationInfo {
    // pageType: go.Type;
    // pageRequestType: go.Type;
    // pagePropertySetter: go.CodeBlock;

    // TODO: These are the abstraction-facing values.
    prepareCall: go.AstNode;
    readPageResponse: go.AstNode;
    initializePager: go.AstNode;
    callGetPage: go.AstNode;
}
