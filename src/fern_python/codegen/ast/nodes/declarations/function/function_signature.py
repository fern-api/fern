from typing import Sequence, Set

from ....ast_node import AstNode, GenericTypeVar, NodeWriter, ReferenceResolver
from ....references import Reference
from ...type_hint import TypeHint
from .function_parameter import FunctionParameter


class FunctionSignature(AstNode):
    def __init__(
        self,
        *,
        parameters: Sequence[FunctionParameter] = None,
        include_args: bool = False,
        named_parameters: Sequence[FunctionParameter] = None,
        include_kwargs: bool = False,
        return_type: TypeHint,
    ):
        self.parameters = parameters or []
        self.include_args = include_args
        self.named_parameters = named_parameters or []
        self.include_kwargs = include_kwargs
        self.return_type = return_type

    def get_references(self) -> Set[Reference]:
        references: Set[Reference] = set()
        for parameter in self.parameters:
            references.update(parameter.get_references())
        for named_parameter in self.named_parameters:
            references.update(named_parameter.get_references())
        references.update(self.return_type.get_references())
        return references

    def get_generics(self) -> Set[GenericTypeVar]:
        generics: Set[GenericTypeVar] = set()
        for parameter in self.parameters:
            generics.update(parameter.get_generics())
        for named_parameter in self.named_parameters:
            generics.update(named_parameter.get_generics())
        generics.update(self.return_type.get_generics())
        return generics

    def write(self, writer: NodeWriter, reference_resolver: ReferenceResolver) -> None:
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
            writer.write("*args")
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

        writer.write(") -> ")
        writer.write_node(self.return_type)
        writer.write(":")
