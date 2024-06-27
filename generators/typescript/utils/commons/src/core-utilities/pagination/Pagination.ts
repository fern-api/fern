import { ts } from "ts-morph";

export interface Pagination {
    readonly Page: {
        _getReferenceToType: (itemType: ts.TypeNode) => ts.TypeNode;
    };

    readonly Pageable: {
        _construct: (args: {
            responseType: ts.TypeNode;
            itemType: ts.TypeNode;
            response: ts.Expression;
            hasNextPage: ts.Expression;
            getItems: ts.Expression;
            loadPage: ts.Expression;
        }) => ts.Expression;
        _getReferenceToType: (response: ts.TypeNode, itemType: ts.TypeNode) => ts.TypeNode;
    };
}
