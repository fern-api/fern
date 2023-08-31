from typing import List

from fern_python.codegen import AST
from fern_python.codegen.node_writer_impl import NodeWriterImpl
from fern_python.codegen.reference_resolver_impl import ReferenceResolverImpl


class SnippetGenerator:
    def __init__(self) -> None:
        self.nodes: List[AST.AstNode] = []

    def add_arbitrary_code(self, writer: AST.CodeWriter) -> None:
        self.nodes.append(writer)

    def to_str(self) -> str:
        writer = NodeWriterImpl(
            should_format=True,
            reference_resolver=ReferenceResolverImpl(module_path_of_source_file=()),
        )
        for node in self.nodes:
            writer.write_node(node)
        return writer.to_str()
