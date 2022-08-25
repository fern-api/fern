import { ts } from "ts-morph";

export type TypeReferenceNode =
    | { isOptional: false; typeNode: ts.TypeNode }
    | {
          isOptional: true;
          typeNode: ts.TypeNode;
          typeNodeWithoutUndefined: ts.TypeNode;
      };
