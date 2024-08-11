from typing import Optional, Sequence, Union

from ....ast_node import AstNode, AstNodeMetadata, NodeWriter
from ...type_hint import TypeHint
from .function_parameter import FunctionParameter
from .named_function_parameter import NamedFunctionParameter


class FunctionSignature(AstNode):
    def __init__(
        self,
        *,
        parameters: Optional[Sequence[FunctionParameter]] = None,
        include_args: bool = False,
        named_parameters: Optional[Sequence[NamedFunctionParameter]] = None,
        include_kwargs: bool = False,
        return_type: Optional[Union[TypeHint, str]] = None,
    ):
        self.parameters = parameters or []
        self.include_args = include_args
        self.named_parameters = named_parameters or []
        self.include_kwargs = include_kwargs
        self.return_type = return_type

    def has_arguments(self) -> bool:
        return len(self.parameters) > 0 or self.include_args or len(self.named_parameters) > 0 or self.include_kwargs

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()
        for parameter in self.parameters:
            metadata.update(parameter.get_metadata())
        for named_parameter in self.named_parameters:
            metadata.update(named_parameter.get_metadata())
        if self.return_type is not None and isinstance(self.return_type, AstNode):
            metadata.update(self.return_type.get_metadata())
        return metadata

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        writer.write("(")
        just_wrote_parameter = False

        for parameter in self.parameters:
            if just_wrote_parameter:
                writer.write(", ")
            writer.write_node(parameter)
            just_wrote_parameter = True

        if self.include_args:
            if just_wrote_parameter:
                writer.write(", ")
            writer.write("*args: ")
            writer.write_node(TypeHint.any())
            just_wrote_parameter = True
        elif len(self.named_parameters) > 0:
            if just_wrote_parameter:
                writer.write(", ")
            writer.write("*")
            just_wrote_parameter = True

        for named_parameter in self.named_parameters:
            if just_wrote_parameter:
                writer.write(", ")
            writer.write_node(named_parameter)
            just_wrote_parameter = True

        if self.include_kwargs:
            if just_wrote_parameter:
                writer.write(", ")
            writer.write("**kwargs: ")
            writer.write_node(TypeHint.any())
            just_wrote_parameter = True

        writer.write(")")
        if self.return_type is not None:
            writer.write(" -> ")
            if isinstance(self.return_type, str):
                writer.write(self.return_type)
            else:
                writer.write_node(self.return_type)
        writer.write(":")
