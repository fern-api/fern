import typing
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional

import fern.ir.resources as ir_types
from ..context.sdk_generator_context import SdkGeneratorContext
from .constants import DEFAULT_BODY_PARAMETER_VALUE
from .endpoint_metadata_collector import EndpointMetadataCollector
from .endpoint_response_code_writer import EndpointResponseCodeWriter
from typing_extensions import Unpack

from fern_python.codegen import AST, SourceFile
from fern_python.codegen.ast.ast_node.ast_node_metadata import AstNodeMetadata
from fern_python.codegen.ast.nodes.code_writer.code_writer import CodeWriter, CodeWriterFunction
from fern_python.codegen.imports_manager import ImportsManager
from fern_python.codegen.reference_resolver import ReferenceResolver
from fern_python.snippet import SnippetRegistry, SnippetWriter


@dataclass
class ConstructorParameter:
    constructor_parameter_name: str
    type_hint: AST.TypeHint
    private_member_name: typing.Optional[str] = None
    initializer: Optional[AST.Expression] = None


ConstructorParameterT = typing.TypeVar("ConstructorParameterT", bound=ConstructorParameter)


HTTPX_PRIMITIVE_DATA_TYPES = set(
    [
        ir_types.PrimitiveTypeV1.STRING,
        ir_types.PrimitiveTypeV1.INTEGER,
        ir_types.PrimitiveTypeV1.DOUBLE,
        ir_types.PrimitiveTypeV1.BOOLEAN,
    ]
)


class BaseClientGeneratorKwargs(typing.TypedDict):
    context: SdkGeneratorContext
    package: ir_types.Package
    class_name: str
    async_class_name: str
    snippet_registry: SnippetRegistry
    snippet_writer: SnippetWriter
    endpoint_metadata_collector: EndpointMetadataCollector
    websocket: Optional[ir_types.WebSocketChannel]
    imports_manager: ImportsManager
    reference_resolver: ReferenceResolver


class BaseClientGenerator(ABC, typing.Generic[ConstructorParameterT]):
    """Base class for client generators with common functionality."""

    RESPONSE_JSON_VARIABLE = EndpointResponseCodeWriter.RESPONSE_JSON_VARIABLE
    TOKEN_CONSTRUCTOR_PARAMETER_NAME = "token"
    TOKEN_MEMBER_NAME = "_token"

    def __init__(self, **kwargs: Unpack[BaseClientGeneratorKwargs]):
        self._context = kwargs["context"]
        self._package = kwargs["package"]
        self._class_name = kwargs["class_name"]
        self._async_class_name = kwargs["async_class_name"]
        self._snippet_registry = kwargs["snippet_registry"]
        self._snippet_writer = kwargs["snippet_writer"]
        self._endpoint_metadata_collector = kwargs["endpoint_metadata_collector"]
        self._websocket = kwargs["websocket"]
        self._imports_manager = kwargs["imports_manager"]
        self._reference_resolver = kwargs["reference_resolver"]
        self._is_default_body_parameter_used = False

    def generate(self, source_file: SourceFile) -> None:
        """Generate client classes and add them to the source file."""
        # Create class declarations
        sync_class_declaration = self._create_class_declaration(is_async=False)
        async_class_declaration = self._create_class_declaration(is_async=True)

        # Add default body parameter if needed
        if self._is_default_body_parameter_used:
            source_file.add_arbitrary_code(AST.CodeWriter(self._write_default_param))

        # Add class declarations to source file
        source_file.add_class_declaration(
            declaration=sync_class_declaration,
            should_export=False,
        )
        source_file.add_class_declaration(
            declaration=async_class_declaration,
            should_export=False,
        )

    def _create_class_declaration_base(self, *, is_async: bool) -> AST.ClassDeclaration:
        """Create the base structure of a class declaration. To be extended by subclasses."""
        constructor_parameters = self._get_constructor_parameters(is_async=is_async)

        named_parameters = [
            AST.NamedFunctionParameter(
                name=param.constructor_parameter_name,
                type_hint=param.type_hint,
                initializer=param.initializer,
            )
            for param in constructor_parameters
        ]

        return AST.ClassDeclaration(
            name=self._async_class_name if is_async else self._class_name,
            constructor=AST.ClassConstructor(
                signature=AST.FunctionSignature(
                    named_parameters=named_parameters,
                ),
                body=AST.CodeWriter(self._get_write_constructor_body(is_async=is_async)),
            ),
        )

    def _get_write_constructor_body_base(
        self, *, constructor_parameters: List[ConstructorParameter]
    ) -> CodeWriterFunction:
        """Base implementation for writing constructor body."""

        def _write_constructor_body_base(writer: AST.NodeWriter) -> None:
            for param in constructor_parameters:
                if param.private_member_name is not None:
                    writer.write_node(
                        AST.VariableDeclaration(
                            name=f"self.{param.private_member_name}",
                            initializer=AST.Expression(param.constructor_parameter_name),
                        )
                    )

        return _write_constructor_body_base

    def _write_default_param(self, writer: AST.NodeWriter) -> None:
        writer.write_line("# this is used as the default value for optional parameters")
        writer.write(f"{DEFAULT_BODY_PARAMETER_VALUE} = ")
        writer.write_node(AST.TypeHint.cast(AST.TypeHint.any(), AST.Expression("...")))
        writer.write_newline_if_last_line_not()

    def _environment_is_enum(self) -> bool:
        return self._context.ir.environments is not None

    def _is_streaming_endpoint(self, endpoint: ir_types.HttpEndpoint) -> bool:
        """Check if an endpoint is a streaming endpoint (but not a stream parameter endpoint)"""
        if endpoint.response is None or endpoint.response.body is None:
            return False

        body_type = endpoint.response.body.get_as_union().type
        return body_type == "streaming" or body_type == "streamParameter"

    def _is_stream_parameter_endpoint(self, endpoint: ir_types.HttpEndpoint) -> bool:
        """Check if an endpoint is a stream parameter endpoint"""
        return (
            endpoint.response is not None
            and endpoint.response.body is not None
            and endpoint.response.body.get_as_union().type == "streamParameter"
        )

    def _get_raw_client_member_name(self) -> str:
        return "_raw_client"

    def _get_client_wrapper_member_name(self) -> str:
        return "_client_wrapper"

    def _initialize_nested_clients(
        self, *, writer: AST.NodeWriter, is_async: bool, declare_client_wrapper: bool
    ) -> None:
        should_declare_client_wrapper = declare_client_wrapper

        for subpackage_id in self._package.subpackages:
            subpackage = self._context.ir.subpackages[subpackage_id]
            if subpackage.has_endpoints_in_tree:
                if should_declare_client_wrapper:
                    writer.write_line("self._client_wrapper = client_wrapper")
                    should_declare_client_wrapper = False

                if self._context.custom_config.lazy_imports:
                    service_reference = (
                        self._context.get_reference_to_async_subpackage_service(subpackage_id, lazy_import=True)
                        if is_async
                        else self._context.get_reference_to_subpackage_service(subpackage_id, lazy_import=True)
                    )
                    writer.write_node(
                        AST.VariableDeclaration(
                            name=f"self._{subpackage.name.snake_case.safe_name}",
                            type_hint=AST.TypeHint.optional(AST.TypeHint(type=service_reference)),
                            initializer=AST.Expression("None"),
                        )
                    )
                else:
                    writer.write_node(
                        AST.VariableDeclaration(
                            name=f"self.{subpackage.name.snake_case.safe_name}",
                            initializer=AST.Expression(
                                self._get_subpackage_service_instantiation(
                                    subpackage_id=subpackage_id, is_async=is_async
                                )
                            ),
                        )
                    )

    def _get_subpackage_service_instantiation(
        self, *, subpackage_id: ir_types.SubpackageId, is_async: bool
    ) -> AST.ClassInstantiation:
        kwargs = [
            (
                "client_wrapper",
                AST.Expression(f"self.{self._get_client_wrapper_member_name()}"),
            )
        ]
        return AST.ClassInstantiation(
            class_=(
                self._context.get_reference_to_async_subpackage_service(
                    subpackage_id, lazy_import=self._context.custom_config.lazy_imports
                )
                if is_async
                else self._context.get_reference_to_subpackage_service(
                    subpackage_id, lazy_import=self._context.custom_config.lazy_imports
                )
            ),
            kwargs=kwargs,
        )

    def _generate_lazy_import_property(
        self,
        *,
        subpackage: ir_types.Subpackage,
        subpackage_id: ir_types.SubpackageId,
        is_async: bool,
    ) -> list[AST.AstNode]:
        attr_name = f"self._{subpackage.name.snake_case.safe_name}"
        service_instantiation = self._get_subpackage_service_instantiation(
            subpackage_id=subpackage_id, is_async=is_async
        )
        service_import = service_instantiation.get_class_reference().import_
        if service_import is None:
            raise ValueError(f"Could not evaluate import for {subpackage.name.snake_case.safe_name}")

        lazy_import_statement = CodeWriter(
            lambda writer: writer.write_line(
                self._imports_manager.get_resolved_import_as_string(
                    import_=service_import,
                    reference_resolver=self._reference_resolver,
                    noqas=["E402"],
                )
            )
        )
        # HACK(tjb9dc): We need this to be truly lazy, since we are managing the references/imports manually
        lazy_import_statement.get_metadata = lambda: AstNodeMetadata()  # type:ignore[method-assign]

        return [
            AST.ConditionalTree(
                conditions=[
                    AST.IfConditionLeaf(
                        condition=AST.Expression(f"{attr_name} is None"),
                        code=[
                            lazy_import_statement,
                            AST.VariableDeclaration(
                                name=attr_name,
                                initializer=AST.Expression(service_instantiation),
                            ),
                        ],
                    )
                ],
                else_code=None,
            ),
            AST.ReturnStatement(AST.Expression(attr_name)),
        ]

    def _generate_lazy_import_properties(self, *, class_declaration: AST.ClassDeclaration, is_async: bool) -> None:
        if self._context.custom_config.lazy_imports:
            for subpackage_id in self._package.subpackages:
                subpackage = self._context.ir.subpackages[subpackage_id]
                if subpackage.has_endpoints_in_tree:
                    class_declaration.add_method(
                        declaration=AST.FunctionDeclaration(
                            name=subpackage.name.snake_case.safe_name,
                            is_async=False,
                            signature=AST.FunctionSignature(parameters=[]),
                            decorators=[
                                AST.Expression(
                                    AST.Reference(qualified_name_excluding_import=("property",), import_=None)
                                )
                            ],
                            body=self._generate_lazy_import_property(
                                subpackage=subpackage,
                                subpackage_id=subpackage_id,
                                is_async=is_async,
                            ),
                        )
                    )

    @abstractmethod
    def _create_class_declaration(self, *, is_async: bool) -> AST.ClassDeclaration:
        """
        Create a class declaration for the client.
        This method should be implemented by subclasses.
        """

    @abstractmethod
    def _get_constructor_parameters(self, *, is_async: bool) -> typing.List[ConstructorParameterT]:
        """
        Get constructor parameters for the client.
        This method should be implemented by subclasses.
        """

    @abstractmethod
    def _get_write_constructor_body(self, *, is_async: bool) -> CodeWriterFunction:
        """
        Get a function to write the constructor body.
        This method should be implemented by subclasses.
        """

    @abstractmethod
    def get_raw_client_class_name(self, *, is_async: bool) -> str:
        """
        Get the name of the raw client class.
        This method should be implemented by subclasses.
        """

    @abstractmethod
    def get_raw_client_class_reference(self, *, is_async: bool) -> AST.ClassReference:
        """
        Get the reference to the raw client class.
        This method should be implemented by subclasses.
        """
