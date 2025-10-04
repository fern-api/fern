from typing import NoReturn

from ..context import FastApiGeneratorContext
from .basic_auth_generator import BasicAuthGenerator
from .bearer_auth_generator import BearerAuthGenerator
from .header_auth_generator import HeaderAuthGenerator

from fern_python.codegen import AST, Filepath, Project
from fern_python.external_dependencies import FastAPI
from fern_python.generator_exec_wrapper import GeneratorExecWrapper


def raise_on_inferred_auth() -> NoReturn:
    raise ValueError("Inferred auth is not supported yet")


class SecurityFileGenerator:
    _API_AUTH_TYPE = "ApiAuth"
    _MODULE_NAME = "security"
    _METHOD_NAME = "FernAuth"
    _AUTH_PARAMETER_NAME = "auth"

    def __init__(self, context: FastApiGeneratorContext):
        self._context = context

    @staticmethod
    def get_reference_to_fern_auth_dependency(context: FastApiGeneratorContext) -> AST.Expression:
        return FastAPI.Depends(
            AST.Expression(
                AST.Reference(
                    import_=AST.ReferenceImport(
                        module=SecurityFileGenerator._get_filepath(context).to_module(),
                        named_import=SecurityFileGenerator._METHOD_NAME,
                    ),
                    qualified_name_excluding_import=(),
                )
            )
        )

    @staticmethod
    def get_reference_to_parsed_auth(context: FastApiGeneratorContext) -> AST.TypeHint:
        return AST.TypeHint(
            type=AST.ClassReference(
                import_=AST.ReferenceImport(
                    module=SecurityFileGenerator._get_filepath(context).to_module(),
                    named_import=SecurityFileGenerator._API_AUTH_TYPE,
                ),
                qualified_name_excluding_import=(),
            )
        )

    @staticmethod
    def _get_filepath(context: FastApiGeneratorContext) -> Filepath:
        return Filepath(
            directories=(),
            file=Filepath.FilepathPart(module_name=SecurityFileGenerator._MODULE_NAME),
        )

    def generate_security_file(self, project: Project, generator_exec_wrapper: GeneratorExecWrapper) -> None:
        auth = self._context.ir.auth
        if len(auth.schemes) == 0:
            return
        if len(auth.schemes) > 1:
            raise ValueError("The FastAPI generator only supports a single authentication scheme.")
        auth_scheme = auth.schemes[0]

        auth_generator = auth_scheme.visit(
            bearer=lambda x: BearerAuthGenerator(context=self._context),
            basic=lambda x: BasicAuthGenerator(context=self._context),
            header=lambda header: HeaderAuthGenerator(context=self._context, http_header=header),
            oauth=lambda x: BearerAuthGenerator(context=self._context),
            inferred=lambda _: raise_on_inferred_auth(),
        )
        parsed_auth_type = auth_generator.get_parsed_auth_type()

        security_filepath = SecurityFileGenerator._get_filepath(context=self._context)
        source_file = self._context.source_file_factory.create(
            project=project,
            generator_exec_wrapper=generator_exec_wrapper,
            filepath=security_filepath,
        )
        source_file.add_declaration(
            declaration=AST.VariableDeclaration(
                name=SecurityFileGenerator._API_AUTH_TYPE,
                initializer=AST.Expression(parsed_auth_type),
            ),
            should_export=True,
        )
        source_file.add_declaration(
            should_export=False,
            declaration=AST.FunctionDeclaration(
                name=SecurityFileGenerator._METHOD_NAME,
                signature=AST.FunctionSignature(
                    parameters=[
                        AST.FunctionParameter(
                            name=SecurityFileGenerator._AUTH_PARAMETER_NAME,
                            type_hint=parsed_auth_type,
                            initializer=auth_generator.get_dependency(),
                        )
                    ],
                    return_type=parsed_auth_type,
                ),
                body=AST.CodeWriter(self._write_fern_auth_body),
            ),
        )
        project.write_source_file(source_file=source_file, filepath=security_filepath)

    def _write_fern_auth_body(self, writer: AST.NodeWriter) -> None:
        writer.write_line(f"return {SecurityFileGenerator._AUTH_PARAMETER_NAME}")
