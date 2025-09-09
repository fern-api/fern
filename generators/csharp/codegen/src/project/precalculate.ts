import {
    EnumTypeDeclaration,
    ObjectTypeDeclaration,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api/resources/types/types";
import { nameRegistry } from "..";
import { AbstractCsharpGeneratorContext, STRING_ENUM_SERIALIZER_CLASS_NAME } from "../context/AbstractCsharpGeneratorContext";
import { classReference, freezeClassReferences } from "../csharp";
import { BaseCsharpCustomConfigSchema } from "../custom-config/BaseCsharpCustomConfigSchema";

/**
 * this function goes thru the motions of figuring out what the names of everything will be generated as
 * including namespaces and types, and ensures that there are not conflicts or ambiguities
 *
 * After this, the csharp.classReference() function will not create instances that aren't already known
 *
 */
export function precalculate(context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>) {
    // types that can get used
    nameRegistry.trackType(context.getReadOnlyAdditionalPropertiesClassReference());
    nameRegistry.trackType(context.getJsonUtilsClassReference());
    
    nameRegistry.trackType(
        classReference({
            name: "IStringEnum",
            namespace: context.getCoreNamespace()
        })
    );
    nameRegistry.trackType( classReference({
      namespace: context.getCoreNamespace(),
      name: STRING_ENUM_SERIALIZER_CLASS_NAME
    }));

    // start with the models
    for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        if (context.protobufResolver.isWellKnownProtobufType(typeId)) {
            // The well-known Protobuf types are generated separately.
            continue;
        }

        const result = typeDeclaration.shape._visit({
            alias: () => undefined,
            undiscriminatedUnion: () => undefined,
            _other: () => undefined,

            enum: (etd: EnumTypeDeclaration) => {
                //
                // return context.isForwardCompatibleEnumsEnabled()
                // ? new StringEnumGenerator(context, typeDeclaration, etd).generate()
                // : new EnumGenerator(context, typeDeclaration, etd).generate();

                const enclosingType = nameRegistry.trackType(context.csharpTypeMapper.convertToClassReference(typeDeclaration.name));
                if( context.isForwardCompatibleEnumsEnabled()) {
                  // we're generating a string enum
                  // it's going to be a class called Values
                  nameRegistry.trackType(classReference({
                    name: "Values",
                    namespace: context.getNamespace(),
                    enclosingType
                  }));
                }
            },
            object: (otd: ObjectTypeDeclaration) => {
                // generate a class reference for the typedeclaration
                nameRegistry.trackType(context.csharpTypeMapper.convertToClassReference(typeDeclaration.name));

                for (const property of otd.properties) {
                    console.log(`PROP: ${property.name.name.originalName} ${property.valueType.type}`);
                    // const type = context.csharpTypeMapper.convert({ reference: property.valueType });
                    switch (property.valueType.type) {
                        case "named":
                            {
                                nameRegistry.trackType(
                                    context.csharpTypeMapper.convertToClassReference(property.valueType)
                                );
                                const typeDeclaration = context.getTypeDeclarationOrThrow(property.valueType.typeId);
                                switch (typeDeclaration.shape.type) {
                                    case "alias":
                                        break;
                                    case "enum":
                                        break;
                                    case "object":
                                        break;
                                    case "union":
                                        break;
                                    case "undiscriminatedUnion":
                                        typeDeclaration.shape.members.map((member) => {
                                            switch (member.type.type) {
                                                case "named":
                                                    nameRegistry.trackType(
                                                        context.csharpTypeMapper.convertToClassReference(member.type)
                                                    );
                                                    break;
                                                case "primitive":
                                                    break;
                                                case "container":
                                                    break;
                                            }
                                        });
                                        break;
                                }
                            }
                            break;
                        case "primitive":
                            break;
                        case "container":
                            switch (property.valueType.container.type) {
                                case "list":
                                    break;
                                case "map":
                                    break;
                                case "set":
                                    break;
                                case "optional":
                                    switch (property.valueType.container.optional.type) {
                                        case "named":
                                            nameRegistry.trackType(
                                                context.csharpTypeMapper.convertToClassReference(
                                                    property.valueType.container.optional
                                                )
                                            );
                                            break;
                                        case "primitive":
                                            break;
                                        case "container":
                                            break;
                                    }

                                    break;
                                case "nullable":
                                    break;
                                case "literal":
                                    break;
                            }
                            break;
                        case "unknown":
                            break;
                    }

                    // nameRegistry.trackType( context.csharpTypeMapper.convertToClassReference({named: property.valueType}));
                }
            },
            union: (utd: UnionTypeDeclaration) => {
                if (context.shouldGenerateDiscriminatedUnions()) {
                    // return new UnionGenerator(context, typeDeclaration, unionDeclaration).generate();
                    const enclosingType = nameRegistry.trackType(context.csharpTypeMapper.convertToClassReference(typeDeclaration.name));
                    utd.types.map((type) => {
                      type.discriminantValue.name.pascalCase.safeName
                        nameRegistry.trackType(classReference({
                          namespace: enclosingType.namespace,
                          name: type.discriminantValue.name.pascalCase.safeName,
                          enclosingType
                        }));
                    });
                    nameRegistry.trackType(classReference({
                      enclosingType,
                      namespace: enclosingType.namespace,
                      name: "JsonConverter",
                      
                    }));
                    if( utd.baseProperties.length > 0) {
                      nameRegistry.trackType(classReference({
                        enclosingType,
                        namespace: enclosingType.namespace,
                        name: "BaseProperties",
                      }));
                    }
                   //  for( const each of utd.baseProperties) {
//                      nameRegistry.trackType(context.csharpTypeMapper.convertToClassReference(each.valueType));
  //                  }
                }
            }
        });
        if (result !== undefined) {
            throw new Error(`Unexpected result from typeDeclaration.shape._visit: ${result}`);
        }
    }

    nameRegistry.trackType(context.getRawClientClassReference());
    nameRegistry.trackType(context.getRequestOptionsClassReference());
    nameRegistry.trackType(context.getJsonRequestClassReference());
    nameRegistry.trackType(context.getVersionClassReference());
    
    // subpackages
    Object.entries(context.ir.subpackages).forEach(([_, subpackage]) => {
      // generate the subpackage class reference and use canonicalization to ensure 
      // that it doesn't conflict with any previously generated types or namespaces 
      nameRegistry.canonicalizeName(context.getSubpackageClassReference(subpackage));
      if(subpackage.service) {
        const service = context.getHttpServiceOrThrow(subpackage.service);
        for( const endpoint of service.endpoints) {

          endpoint.sdkRequest?.shape._visit({
            wrapper: (wrapper) => {
              if(wrapper.wrapperName && subpackage.service) {
                const requestWrapperReference = context.getRequestWrapperReference(subpackage.service, wrapper.wrapperName);
                const canonicalizedRequestWrapperReference = nameRegistry.canonicalizeName(requestWrapperReference);
                console.log(`REQWRAP1: for ${subpackage.service}::${endpoint.name.originalName} -> ${requestWrapperReference.namespace}.${requestWrapperReference.name} => ${canonicalizedRequestWrapperReference.namespace}.${canonicalizedRequestWrapperReference.name}`)
              }
            },
            justRequestBody: (value) => {
              // console.log(`REQBODY: for ${subpackage.service}::${endpoint.name.originalName}::${value.requestBodyType.type}`)
            },
            _other: (value) => {
              // console.log(`OTHER: for ${subpackage.service}::${endpoint.name.originalName}::${value.type}`)
            }
          })

          const requestWrapperReference = context.getRequestWrapperReference(subpackage.service, endpoint.name);
          const canonicalizedRequestWrapperReference = nameRegistry.canonicalizeName(requestWrapperReference);
          console.log(`REQWRAP: for ${subpackage.service}::${endpoint.name.originalName} -> ${requestWrapperReference.namespace}.${requestWrapperReference.name} => ${canonicalizedRequestWrapperReference.namespace}.${canonicalizedRequestWrapperReference.name}`)
          // nameRegistry.canonicalizeName(context.getRequestWrapperReference(subpackage.service, endpoint.name))
        }
      }
    

    
    });
    freezeClassReferences();
}
