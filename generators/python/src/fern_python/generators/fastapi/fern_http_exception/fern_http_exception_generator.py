from ..context import FastApiGeneratorContext
from fern.ir.resources import NameAndWireValue

from fern_python.codegen import AST, LocalClassReference, Project, SourceFile
from fern_python.external_dependencies import FastAPI
from fern_python.generator_exec_wrapper import GeneratorExecWrapper
from fern_python.generators.fastapi.custom_config import FastAPICustomConfig
from fern_python.pydantic_codegen import PydanticField, PydanticModel


class FernHTTPExceptionGenerator:
    _BODY_CLASS_NAME = "Body"

    def __init__(self, context: FastApiGeneratorContext, custom_config: FastAPICustomConfig):
        self._context = context
        self._custom_config = custom_config
        self.FernHTTPException = context.core_utilities.exceptions.FernHTTPException

    def generate(self, project: Project, generator_exec_wrapper: GeneratorExecWrapper) -> None:
        source_file = self._context.source_file_factory.create(
            project=project,
            generator_exec_wrapper=generator_exec_wrapper,
            filepath=self.FernHTTPException.filepath,
        )
        class_declaration = AST.ClassDeclaration(
            name=self.FernHTTPException.CLASS_NAME,
            is_abstract=True,
            extends=[FastAPI.HTTPException],
            constructor=self._get_constructor(),
        )
        reference_to_class = source_file.add_class_declaration(class_declaration)
        error_discrimination_strategy = self._context.ir.error_discrimination_strategy.get_as_union()
        if error_discrimination_strategy.type == "property":
            reference_to_body = self._construct_pydantic_model(
                source_file=source_file,
                error_discriminant=error_discrimination_strategy.discriminant,
                exception_class=reference_to_class,
            )
            class_declaration.add_method(
                declaration=AST.FunctionDeclaration(
                    name="to_json_response",
                    signature=AST.FunctionSignature(return_type=AST.TypeHint(FastAPI.JSONResponse.REFERENCE)),
                    body=self._create_json_response_body_writer(
                        error_discrimination_strategy.discriminant, reference_to_body=reference_to_body
                    ),
                )
            )
        else:
            class_declaration.add_method(
                declaration=AST.FunctionDeclaration(
                    name="to_json_response",
                    signature=AST.FunctionSignature(return_type=AST.TypeHint(FastAPI.JSONResponse.REFERENCE)),
                    body=self._create_json_response_body_writer_status_code(),
                )
            )
        project.write_source_file(source_file=source_file, filepath=self.FernHTTPException.filepath)

    def _get_constructor(self) -> AST.ClassConstructor:
        return AST.ClassConstructor(
            body=AST.CodeWriter(self._write_constructor_body),
            signature=AST.FunctionSignature(
                parameters=[
                    AST.FunctionParameter(
                        name=self.FernHTTPException.STATUS_CODE_MEMBER, type_hint=AST.TypeHint.int_()
                    ),
                    AST.FunctionParameter(
                        name=self.FernHTTPException.NAME_MEMBER,
                        type_hint=AST.TypeHint.optional(AST.TypeHint.str_()),
                        initializer=AST.Expression("None"),
                    ),
                    AST.FunctionParameter(
                        name=self.FernHTTPException.CONTENT_MEMBER,
                        type_hint=AST.TypeHint.optional(AST.TypeHint.any()),
                        initializer=AST.Expression("None"),
                    ),
                ]
            ),
        )

    def _write_constructor_body(self, writer: AST.NodeWriter) -> None:
        writer.write_line(f"super().__init__(status_code={self.FernHTTPException.STATUS_CODE_MEMBER})")
        writer.write_line(f"self.{self.FernHTTPException.NAME_MEMBER} = {self.FernHTTPException.NAME_MEMBER}")
        writer.write_line(
            f"self.{self.FernHTTPException.STATUS_CODE_MEMBER} = {self.FernHTTPException.STATUS_CODE_MEMBER}"
        )
        writer.write_line(f"self.{self.FernHTTPException.CONTENT_MEMBER} = {self.FernHTTPException.CONTENT_MEMBER}")

    def _construct_pydantic_model(
        self, source_file: SourceFile, error_discriminant: NameAndWireValue, exception_class: LocalClassReference
    ) -> AST.ClassReference:
        with PydanticModel(
            source_file=source_file,
            parent=exception_class,
            name=FernHTTPExceptionGenerator._BODY_CLASS_NAME,
            frozen=self._custom_config.pydantic_config.frozen,
            orm_mode=False,
            version=self._custom_config.pydantic_config.version,
            smart_union=False,
            require_optional_fields=self._custom_config.pydantic_config.require_optional_fields,
            pydantic_base_model=self._context.core_utilities.get_universal_base_model(),
            is_pydantic_v2=self._context.core_utilities.get_is_pydantic_v2(),
            universal_field_validator=self._context.core_utilities.universal_field_validator,
            universal_root_validator=self._context.core_utilities.universal_root_validator,
            update_forward_ref_function_reference=self._context.core_utilities.get_update_forward_refs(),
            field_metadata_getter=lambda: self._context.core_utilities.get_field_metadata(),
            use_pydantic_field_aliases=self._custom_config.pydantic_config.use_pydantic_field_aliases,
        ) as body_pydantic_model:
            body_pydantic_model.add_field(
                PydanticField(
                    name=error_discriminant.name.snake_case.safe_name,
                    type_hint=AST.TypeHint.optional(AST.TypeHint.str_()),
                    json_field_name=error_discriminant.wire_value,
                    pascal_case_field_name=error_discriminant.name.pascal_case.safe_name,
                )
            )
            body_pydantic_model.add_field(
                PydanticField(
                    name=self._get_error_instance_id_field_name(),
                    type_hint=AST.TypeHint(
                        type=AST.ClassReference(
                            import_=AST.ReferenceImport(module=AST.Module.built_in(("uuid",))),
                            qualified_name_excluding_import=("UUID",),
                        )
                    ),
                    json_field_name=self._context.ir.constants.error_instance_id_key.wire_value,
                    pascal_case_field_name=(
                        self._context.ir.constants.error_instance_id_key.name.pascal_case.safe_name
                    ),
                    default_factory=AST.Expression(
                        AST.Reference(
                            import_=AST.ReferenceImport(module=AST.Module.built_in(("uuid",))),
                            qualified_name_excluding_import=("uuid4",),
                        )
                    ),
                )
            )
            body_pydantic_model.add_field(
                PydanticField(
                    name=self._get_error_content_field_name(),
                    type_hint=AST.TypeHint.optional(AST.TypeHint.any()),
                    json_field_name=self._get_content_property().wire_value,
                    pascal_case_field_name=self._get_content_property().name.pascal_case.safe_name,
                )
            )
            return body_pydantic_model.to_reference()

    def _get_error_instance_id_field_name(self) -> str:
        return self._context.ir.constants.error_instance_id_key.name.snake_case.safe_name

    def _get_error_content_field_name(self) -> str:
        return self._get_content_property().name.snake_case.safe_name

    def _get_content_property(self) -> NameAndWireValue:
        error_discrimination_strategy = self._context.ir.error_discrimination_strategy.get_as_union()
        if error_discrimination_strategy.type != "property":
            raise RuntimeError(
                "Error discrimination strategy is not yet supported: " + error_discrimination_strategy.type
            )
        return error_discrimination_strategy.content_property

    def _create_json_response_body_writer(
        self, error_discriminant: NameAndWireValue, reference_to_body: AST.ClassReference
    ) -> AST.CodeWriter:
        def write_body(writer: AST.NodeWriter) -> None:
            BODY_VARIABLE_NAME = "body"
            CONTENT_VARIABLE_NAME = "content"

            writer.write(f"{BODY_VARIABLE_NAME} = ")
            writer.write_node(
                AST.ClassInstantiation(
                    class_=reference_to_body,
                    kwargs=[
                        (
                            error_discriminant.name.snake_case.safe_name,
                            AST.Expression("self." + self.FernHTTPException.NAME_MEMBER),
                        ),
                        (
                            self._get_error_content_field_name(),
                            AST.Expression(AST.CodeWriter(self._write_content_initializer)),
                        ),
                    ],
                )
            )
            (writer.write_line(),)

            writer.write(f"{CONTENT_VARIABLE_NAME} = ")
            writer.write_node(FastAPI.jsonable_encoder(AST.Expression(BODY_VARIABLE_NAME), exclude_none=True))
            writer.write_line()

            writer.write("return ")
            writer.write_node(
                FastAPI.JSONResponse.invoke(
                    content=AST.Expression(CONTENT_VARIABLE_NAME),
                    status_code=AST.Expression(AST.CodeWriter(f"self.{self.FernHTTPException.STATUS_CODE_MEMBER}")),
                )
            )

        return AST.CodeWriter(write_body)

    def _create_json_response_body_writer_status_code(self) -> AST.CodeWriter:
        def write_body(writer: AST.NodeWriter) -> None:
            CONTENT_VARIABLE_NAME = "content"
            writer.write(f"{CONTENT_VARIABLE_NAME} = ")
            writer.write_node(
                FastAPI.jsonable_encoder(
                    AST.Expression(f"self.{self.FernHTTPException.CONTENT_MEMBER}"), exclude_none=True
                )
            )
            writer.write_line()

            writer.write("return ")
            writer.write_node(
                FastAPI.JSONResponse.invoke(
                    content=AST.Expression(CONTENT_VARIABLE_NAME),
                    status_code=AST.Expression(AST.CodeWriter(f"self.{self.FernHTTPException.STATUS_CODE_MEMBER}")),
                )
            )

        return AST.CodeWriter(write_body)

    def _write_content_initializer(self, writer: AST.NodeWriter) -> None:
        writer.write(f"self.{self.FernHTTPException.CONTENT_MEMBER} or ")
        writer.write_reference(
            reference=AST.Reference(
                qualified_name_excluding_import=("HTTPStatus",),
                import_=AST.ReferenceImport(module=AST.Module.built_in(("http",))),
            )
        )
        writer.write(f"(self.{self.FernHTTPException.STATUS_CODE_MEMBER}).phrase")
