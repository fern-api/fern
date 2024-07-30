from __future__ import annotations

from typing import List, Optional, Union

from ...ast_node import AstNode, AstNodeMetadata, GenericTypeVar, NodeWriter


class TypeParameter(AstNode):
    def __init__(
        self,
        type_parameter: Union[AstNode, GenericTypeVar, List[TypeParameter]],
        is_string_reference: bool = False,
    ):
        self._type_parameter = type_parameter
        self._is_string_reference = is_string_reference

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()
        if isinstance(self._type_parameter, AstNode):
            metadata.update(self._type_parameter.get_metadata())
        elif isinstance(self._type_parameter, GenericTypeVar):
            metadata.generics.add(self._type_parameter)
        elif isinstance(self._type_parameter, list):
            for type_parameter in self._type_parameter:
                metadata.update(type_parameter.get_metadata())
        return metadata

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        if isinstance(self._type_parameter, AstNode):
            self._type_parameter.write(writer=writer)
        elif isinstance(self._type_parameter, GenericTypeVar):
            writer.write(self._type_parameter.name)
        elif isinstance(self._type_parameter, list):
            writer.write("[")
            just_wrote_parameter = False
            for i, type_parameter in enumerate(self._type_parameter):
                if just_wrote_parameter:
                    writer.write(", ")
                type_parameter.write(writer=writer)
                just_wrote_parameter = True
            writer.write("]")
