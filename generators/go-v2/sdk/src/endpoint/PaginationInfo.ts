import { go } from "@fern-api/go-ast";

export interface PaginationInfo {
    prepareCall: go.AstNode;
    readPageResponse: go.AstNode;
    initializePager: go.AstNode;
    callGetPage: go.AstNode;
}
