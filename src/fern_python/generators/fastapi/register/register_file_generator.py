from fern_python.codegen import AST, Filepath, Project, SourceFile
from fern_python.generator_exec_wrapper import GeneratorExecWrapper
from fern_python.source_file_generator import SourceFileGenerator

from ..context import FastApiGeneratorContext
from ..external_dependencies import FastAPI
from .service_initializer import ServiceInitializer


class RegisterFileGenerator:
    _MODULE_NAME = "register"
    _REGISTER_FUNCTION_NAME = "register"
    _REGISTER_SERVICE_FUNCTION_NAME = "__register_service"
    _APP_PARAMETER_NAME = "app"
    _SERVICE_PARAMETER_NAME = "service"

    def __init__(self, context: FastApiGeneratorContext):
        self._context = context
        self._service_initializers = [
            ServiceInitializer(context=context, service=service) for service in self._context.ir.services.http
        ]

    def generate_registry_file(self, project: Project, generator_exec_wrapper: GeneratorExecWrapper) -> None:
        with SourceFileGenerator.generate(
            project=project,
            generator_exec_wrapper=generator_exec_wrapper,
            filepath=Filepath(
                directories=(self._context.filepath_creator.generate_filepath_prefix()),
                file=Filepath.FilepathPart(module_name=RegisterFileGenerator._MODULE_NAME),
            ),
        ) as source_file:
            source_file.add_declaration(declaration=self._get_register_method(source_file), should_export=False)
            source_file.add_declaration(declaration=self._get_register_service_method(source_file), should_export=False)

    def _get_register_method(self, source_file: SourceFile) -> AST.FunctionDeclaration:
        return AST.FunctionDeclaration(
            name=RegisterFileGenerator._REGISTER_FUNCTION_NAME,
            signature=AST.FunctionSignature(
                parameters=[
                    AST.FunctionParameter(name=RegisterFileGenerator._APP_PARAMETER_NAME, type_hint=FastAPI.FastAPI),
                ],
                named_parameters=[
                    service_initializer.get_register_parameter() for service_initializer in self._service_initializers
                ],
                return_type=AST.TypeHint.none(),
            ),
            body=AST.CodeWriter(self._write_register_method_body),
        )

    def _write_register_method_body(self, writer: AST.NodeWriter) -> None:
        for service_initializer in self._service_initializers:
            writer.write_node(
                node=FastAPI.include_router(
                    app_variable=RegisterFileGenerator._APP_PARAMETER_NAME,
                    router=AST.Expression(
                        AST.FunctionInvocation(
                            function_definition=AST.Reference(
                                qualified_name_excluding_import=(RegisterFileGenerator._REGISTER_SERVICE_FUNCTION_NAME,)
                            ),
                            args=[AST.Expression(service_initializer.get_parameter_name())],
                        )
                    ),
                )
            )
            writer.write_line()
        writer.write_line()
        writer.write_node(
            FastAPI.exception_handler(
                app_variable=RegisterFileGenerator._APP_PARAMETER_NAME,
                exception_type=self._context.core_utilities.FernHTTPException(),
                body=AST.CodeWriter(self._write_exception_handler_body),
            )
        )

    def _write_exception_handler_body(self, writer: AST.NodeWriter) -> None:
        writer.write_line(f"return {FastAPI.EXCEPTION_HANDLER_EXCEPTION_ARGUMENT}.to_json_response()")

    def _get_register_service_method(self, source_file: SourceFile) -> AST.FunctionDeclaration:
        return AST.FunctionDeclaration(
            name=RegisterFileGenerator._REGISTER_SERVICE_FUNCTION_NAME,
            signature=AST.FunctionSignature(
                parameters=[
                    AST.FunctionParameter(
                        name=RegisterFileGenerator._SERVICE_PARAMETER_NAME,
                        type_hint=AST.TypeHint(type=self._context.core_utilities.AbstractFernService()),
                    ),
                ],
                return_type=AST.TypeHint(type=FastAPI.APIRouter.REFERENCE),
            ),
            body=AST.CodeWriter(self._write_register_service_method_body),
        )

    def _write_register_service_method_body(self, writer: AST.NodeWriter) -> None:
        ROUTER_VARIABLE_NAME = "router"
        writer.write(f"{ROUTER_VARIABLE_NAME} = ")
        writer.write_node(FastAPI.APIRouter.invoke())
        writer.write_line()
        writer.write_line(
            f"type({RegisterFileGenerator._SERVICE_PARAMETER_NAME})."
            + f"{self._context.core_utilities.INIT_FERN_METHOD_NAME}"
            + f"({ROUTER_VARIABLE_NAME})",
        )
        writer.write_line(f"return {ROUTER_VARIABLE_NAME}")
