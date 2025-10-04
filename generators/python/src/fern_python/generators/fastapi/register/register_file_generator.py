import fern.ir.resources as ir_types
from ..context import FastApiGeneratorContext
from .service_initializer import ServiceInitializer

from fern_python.codegen import AST, Filepath, Project
from fern_python.external_dependencies import FastAPI, Starlette
from fern_python.generator_exec_wrapper import GeneratorExecWrapper

FAST_API_REGISTRATION_ARGS = [("dependencies", AST.TypeHint.optional(AST.TypeHint.sequence(FastAPI.DependsType)))]


class RegisterFileGenerator:
    _MODULE_NAME = "register"
    _REGISTER_FUNCTION_NAME = "register"
    _REGISTER_SERVICE_FUNCTION_NAME = "__register_service"
    _APP_PARAMETER_NAME = "_app"
    _SERVICE_PARAMETER_NAME = "service"

    def __init__(self, context: FastApiGeneratorContext):
        self._context = context
        self._service_initializers = [
            ServiceInitializer(
                context=context,
                service=service,
                is_in_development=service.availability.status == ir_types.AvailabilityStatus.IN_DEVELOPMENT
                if service.availability is not None
                else False,
            )
            for service in self._context.ir.services.values()
        ]

    def generate_registry_file(self, project: Project, generator_exec_wrapper: GeneratorExecWrapper) -> None:
        filepath = Filepath(
            directories=(),
            file=Filepath.FilepathPart(module_name=RegisterFileGenerator._MODULE_NAME),
        )
        source_file = self._context.source_file_factory.create(
            project=project, generator_exec_wrapper=generator_exec_wrapper, filepath=filepath
        )
        source_file.add_declaration(declaration=self._get_register_method(), should_export=False)
        source_file.add_declaration(declaration=self._get_register_service_method(), should_export=False)
        source_file.add_declaration(declaration=self._get_register_validators_method(), should_export=False)
        project.write_source_file(source_file=source_file, filepath=filepath)

    def _get_register_method(self) -> AST.FunctionDeclaration:
        return AST.FunctionDeclaration(
            name=RegisterFileGenerator._REGISTER_FUNCTION_NAME,
            signature=AST.FunctionSignature(
                parameters=[
                    AST.FunctionParameter(name=RegisterFileGenerator._APP_PARAMETER_NAME, type_hint=FastAPI.FastAPI),
                ],
                named_parameters=[
                    service_initializer.get_register_parameter() for service_initializer in self._service_initializers
                ]
                + [
                    AST.NamedFunctionParameter(name=reg_arg[0], type_hint=reg_arg[1], initializer=None)
                    for reg_arg in FAST_API_REGISTRATION_ARGS
                ],
                return_type=AST.TypeHint.none(),
            ),
            body=AST.CodeWriter(self._write_register_method_body),
        )

    def _write_register_method_body(self, writer: AST.NodeWriter) -> None:
        for service_initializer in self._service_initializers:
            parameter_name = service_initializer.get_parameter_name()
            initialize_invocation = FastAPI.include_router(
                app_variable=RegisterFileGenerator._APP_PARAMETER_NAME,
                router=AST.Expression(
                    AST.FunctionInvocation(
                        function_definition=AST.Reference(
                            qualified_name_excluding_import=(RegisterFileGenerator._REGISTER_SERVICE_FUNCTION_NAME,)
                        ),
                        args=[AST.Expression(parameter_name)],
                    )
                ),
                kwargs=[(reg_arg[0], AST.Expression(reg_arg[0])) for reg_arg in FAST_API_REGISTRATION_ARGS],
            )
            if service_initializer.is_in_development:
                writer.write_line(f"if {parameter_name} is not None:")
                with writer.indent():
                    writer.write_node(node=initialize_invocation)
            else:
                writer.write_node(node=initialize_invocation)
            writer.write_line()
        writer.write_line()
        self._write_exception_handler(
            writer=writer,
            exception_type=self._context.core_utilities.exceptions.FernHTTPException.get_reference_to(),
            handler=self._context.core_utilities.exceptions.fern_http_exception_handler(),
        )
        self._write_exception_handler(
            writer=writer,
            exception_type=Starlette.HTTPException,
            handler=self._context.core_utilities.exceptions.http_exception_handler(),
        )
        self._write_exception_handler(
            writer=writer,
            exception_type=AST.ClassReference(qualified_name_excluding_import=("Exception",)),
            handler=self._context.core_utilities.exceptions.default_exception_handler(),
        )

    def _write_exception_handler(
        self, *, writer: AST.NodeWriter, exception_type: AST.ClassReference, handler: AST.Reference
    ) -> None:
        writer.write_node(
            FastAPI.add_exception_handler(
                app_variable=RegisterFileGenerator._APP_PARAMETER_NAME,
                exception_type=exception_type,
                handler=handler,
            )
        )
        # Starlette seems to have some oddities with it's Python version such that it doesn't recognize
        # the base Exception we are using from a typing perspective.
        writer.write_line("  # type: ignore")

    def _get_register_service_method(self) -> AST.FunctionDeclaration:
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

    def _get_register_validators_method(self) -> AST.FunctionDeclaration:
        MODULE_PARAMETER = "module"

        def write_register_validators_method_body(writer: AST.NodeWriter) -> None:
            VALIDATORS_DIRECTORY_VARIABLE = "validators_directory"

            writer.write(f"{VALIDATORS_DIRECTORY_VARIABLE}: str = ")
            writer.write_node(
                AST.FunctionInvocation(
                    function_definition=AST.Reference(
                        import_=AST.ReferenceImport(module=AST.Module.built_in(("os",))),
                        qualified_name_excluding_import=("path", "dirname"),
                    ),
                    args=[AST.Expression(f"{MODULE_PARAMETER}.__file__")],
                )
            )
            writer.write_line("  # type: ignore")

            ABSOLUTE_PATH_VARIABLE = "path"

            writer.write(f"for {ABSOLUTE_PATH_VARIABLE} in ")
            writer.write_node(
                AST.FunctionInvocation(
                    function_definition=AST.Reference(
                        import_=AST.ReferenceImport(module=AST.Module.built_in(("glob",))),
                        qualified_name_excluding_import=("glob",),
                    ),
                    args=[
                        AST.Expression(
                            AST.FunctionInvocation(
                                function_definition=AST.Reference(
                                    import_=AST.ReferenceImport(module=AST.Module.built_in(("os",))),
                                    qualified_name_excluding_import=("path", "join"),
                                ),
                                args=[AST.Expression(VALIDATORS_DIRECTORY_VARIABLE), AST.Expression('"**/*.py"')],
                            )
                        )
                    ],
                    kwargs=[
                        ("recursive", AST.Expression("True")),
                    ],
                )
            )
            writer.write_line(":")

            with writer.indent():
                writer.write("if ")
                writer.write_node(
                    AST.FunctionInvocation(
                        function_definition=AST.Reference(
                            import_=AST.ReferenceImport(module=AST.Module.built_in(("os",))),
                            qualified_name_excluding_import=("path", "isfile"),
                        ),
                        args=[AST.Expression(ABSOLUTE_PATH_VARIABLE)],
                    )
                )
                writer.write_line(":")

                with writer.indent():
                    RELATIVE_PATH_VARIABLE = "relative_path"
                    MODULE_PATH_VARIABLE = "module_path"

                    writer.write(f"{RELATIVE_PATH_VARIABLE} = ")
                    writer.write_node(
                        AST.FunctionInvocation(
                            function_definition=AST.Reference(
                                import_=AST.ReferenceImport(module=AST.Module.built_in(("os",))),
                                qualified_name_excluding_import=("path", "relpath"),
                            ),
                            args=[AST.Expression(ABSOLUTE_PATH_VARIABLE)],
                            kwargs=[("start", AST.Expression(VALIDATORS_DIRECTORY_VARIABLE))],
                        )
                    )
                    writer.write_line()

                    writer.write(f'{MODULE_PATH_VARIABLE} = ".".join(')
                    writer.write(f"[{MODULE_PARAMETER}.__name__] + ")
                    writer.write_line(f'{RELATIVE_PATH_VARIABLE}[:-3].split("/"))')

                    writer.write_node(
                        AST.FunctionInvocation(
                            function_definition=AST.Reference(
                                import_=AST.ReferenceImport(module=AST.Module.built_in(("importlib",))),
                                qualified_name_excluding_import=("import_module",),
                            ),
                            args=[AST.Expression(MODULE_PATH_VARIABLE)],
                        )
                    )
                    writer.write_line()

        return AST.FunctionDeclaration(
            name="register_validators",
            signature=AST.FunctionSignature(
                parameters=[
                    AST.FunctionParameter(
                        name=MODULE_PARAMETER,
                        type_hint=AST.TypeHint(
                            type=AST.ClassReference(
                                import_=AST.ReferenceImport(module=AST.Module.built_in(("types",))),
                                qualified_name_excluding_import=("ModuleType",),
                            )
                        ),
                    )
                ],
                return_type=AST.TypeHint.none(),
            ),
            body=AST.CodeWriter(code_writer=write_register_validators_method_body),
        )
