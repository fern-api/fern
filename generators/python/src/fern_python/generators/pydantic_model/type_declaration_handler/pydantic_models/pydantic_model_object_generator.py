from typing import List, Optional

import fern.ir.resources as ir_types

from fern_python.codegen import AST, SourceFile
from fern_python.snippet import SnippetWriter

from ....context import PydanticGeneratorContext
from ...custom_config import PydanticModelCustomConfig
from ...fern_aware_pydantic_model import FernAwarePydanticModel
from ..object_generator import (
    AbstractObjectGenerator,
    AbstractObjectSnippetGenerator,
    ObjectProperty,
)


class PydanticModelObjectGenerator(AbstractObjectGenerator):
    def __init__(
        self,
        name: Optional[ir_types.DeclaredTypeName],
        extends: List[ir_types.DeclaredTypeName],
        properties: List[ObjectProperty],
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: PydanticModelCustomConfig,
        docs: Optional[str],
        class_name: Optional[str] = None,
        snippet: Optional[str] = None,
    ):
        super().__init__(
            name=name,
            extends=extends,
            properties=properties,
            context=context,
            source_file=source_file,
            custom_config=custom_config,
            docs=docs,
            class_name=class_name,
            snippet=snippet,
            as_request=False,
        )

    def generate(self) -> None:
        with FernAwarePydanticModel(
            class_name=self._class_name,
            type_name=self._name,
            extends=self._extends,
            context=self._context,
            custom_config=self._custom_config,
            source_file=self._source_file,
            docstring=self._docs,
            snippet=self._snippet,
        ) as pydantic_model:
            for property in self._properties:
                pydantic_model.add_field(
                    name=property.name.name.snake_case.safe_name,
                    pascal_case_field_name=property.name.name.pascal_case.safe_name,
                    type_reference=property.value_type,
                    json_field_name=property.name.wire_value,
                    description=property.docs,
                )


class PydanticModelObjectSnippetGenerator(AbstractObjectSnippetGenerator):
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        name: ir_types.DeclaredTypeName,
        example: ir_types.ExampleObjectType,
    ):
        super().__init__(
            snippet_writer=snippet_writer,
            name=name,
            example=example,
        )

    def generate_snippet(self) -> AST.Expression:
        return AST.Expression(
            AST.ClassInstantiation(
                class_=self.snippet_writer.get_class_reference_for_declared_type_name(
                    name=self.name,
                    as_request=False,
                ),
                args=self.snippet_writer.get_snippet_for_object_properties(
                    example=self.example,
                    request_parameter_names={},
                    use_typeddict_request=False,
                    as_request=False,
                    in_typeddict=False,
                ),
            ),
        )
