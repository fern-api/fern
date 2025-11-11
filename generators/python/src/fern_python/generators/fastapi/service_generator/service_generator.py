import fern.ir.resources as ir_types
from ..context import FastApiGeneratorContext
from .endpoint_generator import EndpointGenerator

from fern_python.codegen import AST, SourceFile
from fern_python.external_dependencies import FastAPI


class ServiceGenerator:
    _INIT_FERN_ROUTER_ARGUMENT = "router"

    def __init__(self, context: FastApiGeneratorContext, service: ir_types.HttpService):
        self._context = context
        self._service = service
        self._endpoint_generators = [
            EndpointGenerator(service=service, endpoint=endpoint, context=context) for endpoint in service.endpoints
        ]

    def generate(
        self,
        source_file: SourceFile,
    ) -> None:
        class_declaration = self._generate_empty_class_declaration(
            source_file=source_file,
            context=self._context,
            service=self._service,
        )
        for endpoint_generator in self._endpoint_generators:
            endpoint_generator.add_abstract_method_to_class(class_declaration)
        self._add_abstraction_barrier_message_to_class(class_declaration=class_declaration)
        self._add_init_fern_method(class_declaration=class_declaration)
        for endpoint_generator in self._endpoint_generators:
            endpoint_generator.add_init_method_to_class(class_declaration)
        source_file.add_class_declaration(class_declaration)

    def _generate_empty_class_declaration(
        self,
        source_file: SourceFile,
        context: FastApiGeneratorContext,
        service: ir_types.HttpService,
    ) -> AST.ClassDeclaration:
        class_name = context.get_class_name_for_service(service_name=service.name)
        return AST.ClassDeclaration(
            name=class_name,
            extends=[self._context.core_utilities.AbstractFernService()],
            docstring=AST.Docstring(
                "\n".join(
                    [
                        f"{class_name} is an abstract class containing the methods that you should implement.",
                        "",
                        "Each method is associated with an API route, which will be registered",
                        "with FastAPI when you register your implementation using Fern's register()",
                        "function.",
                    ]
                )
            ),
        )

    def _add_abstraction_barrier_message_to_class(self, class_declaration: AST.ClassDeclaration) -> None:
        class_declaration.add_expression(
            AST.Expression(
                "\n".join(
                    [
                        '"""',
                        "Below are internal methods used by Fern to register your implementation.",
                        "You can ignore them.",
                        '"""',
                    ]
                )
            )
        )

    def _add_init_fern_method(self, class_declaration: AST.ClassDeclaration) -> None:
        class_declaration.add_method(
            decorator=AST.ClassMethodDecorator.CLASS_METHOD,
            declaration=AST.FunctionDeclaration(
                name=self._context.core_utilities.INIT_FERN_METHOD_NAME,
                signature=AST.FunctionSignature(
                    parameters=[
                        AST.FunctionParameter(
                            name=ServiceGenerator._INIT_FERN_ROUTER_ARGUMENT,
                            type_hint=AST.TypeHint(type=FastAPI.APIRouter.REFERENCE),
                        )
                    ],
                    return_type=AST.TypeHint.none(),
                ),
                body=AST.CodeWriter(self._write_init_fern_body),
            ),
        )

    def _write_init_fern_body(self, writer: AST.NodeWriter) -> None:
        for endpoint_generator in self._endpoint_generators:
            writer.write_node(
                endpoint_generator.invoke_init_method(
                    reference_to_fastapi_router=AST.Expression(ServiceGenerator._INIT_FERN_ROUTER_ARGUMENT)
                )
            )
            writer.write_line()
