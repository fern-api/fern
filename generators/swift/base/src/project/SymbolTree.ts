type SubpackageId = string & { __brand: "SubpackageId" };

type SchemaType =
    | {
          type: "struct";
          properties: {
              name: string;
          }[];
      }
    | {
          type: "enum";
          cases: {
              label: string;
              value: string;
          }[];
      };

export interface SymbolTreeInterface {
    rootClient: string;
    subClients: {
        [subpackageId: SubpackageId]: {
            name: string;
            methods: {
                name: string;
                params: {
                    name: string;
                    origin: "header" | "path-param" | "query-param" | "request-body";
                }[];
            }[];
        };
    };
    schemaTypes: {
        [typeId: string]: {
            name: string;
            nestedTypes: SchemaType[];
        };
    };
}

export class SymbolTree {
    public static getSubClientSymbol(subpackageId: string): string {
        throw new Error("Not implemented");
    }

    public getEndpointMethodParameters(endpointId: string): number[] {
        return [];
    }
}
