import { YamlNode } from "../LeafYamlNode";

export interface ServiceDeclarationNode extends YamlNode {
    getKey(): ServiceDeclarationKeyNode;
}
