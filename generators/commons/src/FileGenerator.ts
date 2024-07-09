import { AstNode } from "./AstNode";
import fs from "fs";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FileGenerator {

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static generate(props: { fileName: string, node: AstNode, extension: string, outputDir: string }) {
    const fileNameWithExtension = `${props.fileName}.${props.extension}`;
    const filePath = path.join(props.outputDir, fileNameWithExtension);
    fs.writeFileSync(filePath, props.node.toString());
  }

}