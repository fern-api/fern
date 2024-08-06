import Swift, { SwiftClass } from "@fern-api/swift-codegen";
import { ContainerType, DeclaredTypeName, Literal, MapType, PrimitiveType, TypeReference } from "@fern-fern/ir-sdk/api";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class Utils {

  public static getClassForContainer(value: ContainerType): SwiftClass {
    return value._visit<SwiftClass>({
      list: (value: TypeReference) => {
        return this.getClassForTypeReference(value).toArray();
      },
      map: (value: MapType) => {
        return Swift.makeDictionary({
          keyClass: this.getClassForTypeReference(value.keyType), 
          valueClass: this.getClassForTypeReference(value.valueType) 
        });
      },
      optional: (value: TypeReference) => {
        return this.getClassForTypeReference(value).toOptional();
      },
      set: (value: TypeReference) => {
        return Swift.makeClass({ name: `${value.type} :: set TODO` }); // TODO - Swift: Handle sets (aka Swift dictionaries)
      },
      literal: (value: Literal) => {
        return value._visit<SwiftClass>({
          string: (value: string) => {
            // TODO: Handle full enum in the future
            return Swift.makeString();
          },
          boolean: (value: boolean) => {
            // TODO: Handle full enum in the future
            return Swift.makeBool();
          },
          _other: (value: { type: string; }) => {
            // TODO: Handle full enum in the future
            return Swift.makeAny();
          }
        });
      },
      _other: (value: { type: string; }) => {
        return Swift.makeClass({ name: `${value.type} :: _other TODO` }); // TODO - Swift: Should this be "Any" instead?
      }
    });
  }

  public static getClassForTypeReference(typeReference: TypeReference): SwiftClass {
    return typeReference._visit<SwiftClass>({
      container: (value: ContainerType) => {
        return this.getClassForContainer(value);
      },
      named: (value: DeclaredTypeName) => {
        return Swift.makeClass({ name: value.name.originalName });
      },
      primitive: (value: PrimitiveType) => {
        return Swift.makePrimative({ key: value.v2?.type });
      },
      unknown: () => {
        return Swift.makeAny();
      },
      _other: (value: { type: string; }) => {
        return Swift.makeAny();
      }
    });
  }

}