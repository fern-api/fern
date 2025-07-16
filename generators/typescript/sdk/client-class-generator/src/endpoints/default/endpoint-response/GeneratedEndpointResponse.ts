import { SdkContext } from '@fern-typescript/contexts'
import { ts } from 'ts-morph'

export type PaginationResponseInfo = CursorPaginationResponseInfo | OffsetPaginationResponseInfo

export interface CursorPaginationResponseInfo {
    type: 'cursor'
    responseType: ts.TypeNode
    itemType: ts.TypeNode
    getItems: ts.Expression
    hasNextPage: ts.Expression
    loadPage: ts.Statement[]
}

export interface OffsetPaginationResponseInfo {
    type: 'offset' | 'offset-step'
    initializeOffset: ts.Statement
    responseType: ts.TypeNode
    itemType: ts.TypeNode
    getItems: ts.Expression
    hasNextPage: ts.Expression
    loadPage: ts.Statement[]
}

export interface GeneratedEndpointResponse {
    getPaginationInfo: (context: SdkContext) => PaginationResponseInfo | undefined
    getResponseVariableName: () => string
    getReturnResponseStatements: (context: SdkContext) => ts.Statement[]
    getReturnType: (context: SdkContext) => ts.TypeNode
    getNamesOfThrownExceptions: (context: SdkContext) => string[]
}
