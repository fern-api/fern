import { type Generation } from "../../context/generation-info";
import { AstNode } from "../core/AstNode";
import { Writer } from "../core/Writer";
import { XmlDocWriter } from "../core/XmlDocWriter";
export declare namespace XmlDocBlock {
    type Like = XmlDocBlock | XmlDocBlock.Arg;
    type XmlDocProps = {
        summary?: XmlDocNode;
        codeExample?: XmlDocNode;
        exceptions?: Map<string | AstNode, XmlDocNode>;
        inheritdoc?: InheritdocNode;
        remarks?: XmlDocNode;
    };
    type Arg = XmlDocProps | XmlDocNode;
    type XmlDocNode = string | ((writer: XmlDocWriter) => void) | null | undefined;
    type InheritdocNode =
        | {
              cref: string | undefined;
              path: string | undefined;
          }
        | true;
}

export class XmlDocBlock extends AstNode {
    private arg: XmlDocBlock.Arg;

    public constructor(arg: XmlDocBlock.Arg, generation: Generation) {
        super(generation);
        this.arg = arg;
    }

    public write(writer: Writer): void;
    public write(writer: XmlDocWriter): void;
    public write(writer: Writer | XmlDocWriter): void {
        if (this.arg == null) {
            return;
        }
        const docWriter = writer instanceof Writer ? new XmlDocWriter(writer) : writer;
        if (typeof this.arg === "function") {
            docWriter.writePrefix();
            this.arg(docWriter);
            docWriter.writeNewLineIfLastLineNot();
            return;
        }
        if (typeof this.arg === "string") {
            docWriter.writeMultilineWithEscaping(this.arg);
            docWriter.writeNewLineIfLastLineNot();
            return;
        }
        if (this.arg.summary) {
            docWriter.writePrefix();
            docWriter.writeOpenXmlNode("summary");
            docWriter.writeLine();
            this.writeXmlDocNodeWithEscaping(docWriter, this.arg.summary);
            docWriter.writeNewLineIfLastLineNot();
            docWriter.writePrefix();
            docWriter.writeCloseXmlNode("summary");
            docWriter.writeNewLineIfLastLineNot();
        }
        if (this.arg.codeExample) {
            docWriter.writePrefix();
            docWriter.writeOpenXmlNode("example");
            docWriter.writeOpenXmlNode("code");
            docWriter.writeLine();
            this.writeXmlDocNodeWithEscaping(docWriter, this.arg.codeExample);
            docWriter.writeNewLineIfLastLineNot();
            docWriter.writePrefix();
            docWriter.writeCloseXmlNode("code");
            docWriter.writeCloseXmlNode("example");
            docWriter.writeNewLineIfLastLineNot();
        }
        if (this.arg.exceptions) {
            this.arg.exceptions.forEach((exceptionSummary, exceptionType) => {
                docWriter.writePrefix();
                docWriter.write('<exception cref="');
                docWriter.writeNodeOrString(exceptionType);
                docWriter.write('">');
                this.writeXmlDocNode(docWriter, exceptionSummary);
                docWriter.write("</exception>");
                docWriter.writeNewLineIfLastLineNot();
            });
        }
        if (this.arg.inheritdoc) {
            docWriter.writePrefix();
            docWriter.write("<inheritdoc");
            if (this.arg.inheritdoc !== true) {
                if (this.arg.inheritdoc.cref) {
                    docWriter.write(` cref="${this.arg.inheritdoc.cref}"`);
                }
                if (this.arg.inheritdoc.path) {
                    docWriter.write(` path="${this.arg.inheritdoc.path}"`);
                }
            }
            docWriter.write(" />");

            docWriter.writeNewLineIfLastLineNot();
        }
        if (this.arg.remarks) {
            docWriter.writePrefix();
            docWriter.writeOpenXmlNode("remarks");
            docWriter.writeLine();
            this.writeXmlDocNodeWithEscaping(docWriter, this.arg.remarks);
            docWriter.writeNewLineIfLastLineNot();
            docWriter.writePrefix();
            docWriter.writeCloseXmlNode("remarks");
            docWriter.writeNewLineIfLastLineNot();
        }
    }

    private writeXmlDocNode(writer: XmlDocWriter, node: XmlDocBlock.XmlDocNode): void {
        if (node == null) {
            return;
        }
        if (typeof node === "function") {
            writer.writePrefix();
            node(writer);
            return;
        }
        if (typeof node === "string") {
            writer.writePrefix();
            writer.writeMultiline(node);
        }
    }

    private writeXmlDocNodeWithEscaping(writer: XmlDocWriter, node: XmlDocBlock.XmlDocNode): void {
        if (node == null) {
            return;
        }
        if (typeof node === "function") {
            writer.writePrefix();
            node(writer);
            return;
        }
        if (typeof node === "string") {
            writer.writePrefix();
            writer.writeMultilineWithEscaping(node);
        }
    }
}
