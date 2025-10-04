from abc import ABC
from dataclasses import dataclass
from typing import List, Optional

import fern.ir.resources as ir_types
from ...context.pydantic_generator_context import PydanticGeneratorContext
from ..custom_config import PydanticModelCustomConfig
from .abc.abstract_type_generator import AbstractTypeGenerator
from .abc.abstract_type_snippet_generator import AbstractTypeSnippetGenerator

from fern_python.codegen import SourceFile
from fern_python.snippet import SnippetWriter


@dataclass
class ObjectProperty:
    name: ir_types.NameAndWireValue
    value_type: ir_types.TypeReference
    docs: Optional[str]


class AbstractObjectGenerator(AbstractTypeGenerator, ABC):
    def __init__(
        self,
        name: Optional[ir_types.DeclaredTypeName],
        extends: List[ir_types.DeclaredTypeName],
        properties: List[ObjectProperty],
        context: PydanticGeneratorContext,
        source_file: SourceFile,
        custom_config: PydanticModelCustomConfig,
        as_request: bool,
        docs: Optional[str],
        class_name: Optional[str] = None,
        snippet: Optional[str] = None,
    ):
        super().__init__(
            context=context,
            custom_config=custom_config,
            source_file=source_file,
            docs=docs,
            snippet=snippet,
        )
        self._name = name
        self._extends = extends
        self._properties = properties

        if class_name is None and name is None:
            raise ValueError("Either class_name or name must be provided")
        else:
            if class_name is None:
                assert name is not None  # for mypy, even though the above condition should prevent this
                self._class_name = self._context.get_class_name_for_type_id(name.type_id, as_request=as_request)
            else:
                self._class_name = class_name


class AbstractObjectSnippetGenerator(AbstractTypeSnippetGenerator, ABC):
    def __init__(
        self,
        snippet_writer: SnippetWriter,
        name: ir_types.DeclaredTypeName,
        example: ir_types.ExampleObjectType,
    ):
        super().__init__(
            snippet_writer=snippet_writer,
        )
        self.example = example
        self.name = name
