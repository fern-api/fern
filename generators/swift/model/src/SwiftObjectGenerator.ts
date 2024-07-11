/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable no-console */
import Swift, { ClassLevel, SwiftFile } from "@fern-api/swift-codegen";
import { ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "./ModelGeneratorCli";

export default class SwiftObjectGenerator {

  private readonly context: ModelGeneratorContext;
  private readonly typeDeclaration: TypeDeclaration;
  private readonly objectDeclaration: ObjectTypeDeclaration;

  constructor(
    context: ModelGeneratorContext,
    typeDeclaration: TypeDeclaration,
    objectDeclaration: ObjectTypeDeclaration
  ) {
    this.context = context;
    this.typeDeclaration = typeDeclaration;
    this.objectDeclaration = objectDeclaration;
  }

  public generate(): SwiftFile {

    console.log("generateModel otd");
    console.log(JSON.stringify(this.typeDeclaration, null, 2));

    // const oj; 

    // if (this.typeDeclaration.shape.type === "object") {
    //   this.typeDeclaration.shape.
    // }

    const name = this.typeDeclaration.name.name.pascalCase.safeName;

    // for (this.objectDeclaration.properties) {

    // }

    // const fields: Field[] = [];
    // for (const [_, typeDeclaration] of Object.entries(this.typeDeclaration.shape._visit)) {

    //     // Build file for declaration
    //     const file = typeDeclaration.shape._visit<SwiftFile | undefined>({
    //         alias: () => undefined,
    //         enum: (etd: EnumTypeDeclaration) => undefined,
    //         object: (otd: ObjectTypeDeclaration) => new SwiftObjectGenerator(context, typeDeclaration, otd).generate(),
    //         undiscriminatedUnion: () => undefined,
    //         union: () => undefined,
    //         _other: () => undefined
    //     });

    //     // Add file
    //     if (file != null) {
    //         files.push(file);
    //     }

    // }

    // console.log(JSON.stringify(files));

    const output = Swift.makeFile({
      fileHeader: Swift.makeFileHeader({
        header: `// ${name}.swift`
      }),
      imports: [
        Swift.makeImport({ packageName: "Foundation" }),
      ],
      class: Swift.makeType({
        name: name,
        classLevel: ClassLevel.Struct,
        fields: [],
      })
    });

    return new SwiftFile({
      name: name,
      file: output,
      directory: this.context.config.output.path,
    });

  }

}