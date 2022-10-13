from fern_python.codegen import AST, LocalClassReference, Project, SourceFile
from fern_python.generator_exec_wrapper import GeneratorExecWrapper
from fern_python.pydantic_codegen import PydanticField, PydanticModel
from fern_python.source_file_generator import SourceFileGenerator

from ..context import FastApiGeneratorContext
from ..external_dependencies import FastAPI


class FernHTTPExceptionGenerator:
    _BODY_CLASS_NAME = "Body"

    def __init__(self, context: FastApiGeneratorContext):
        self._context = context
        self.FernHTTPException = context.core_utilities.exceptions.FernHTTPException

    def generate(self, project: Project, generator_exec_wrapper: GeneratorExecWrapper) -> None:
        with SourceFileGenerator.generate(
            project=project,
            generator_exec_wrapper=generator_exec_wrapper,
            filepath=self.FernHTTPException.filepath,
        ) as source_file:
            class_declaration = AST.ClassDeclaration(
                name=self.FernHTTPException.CLASS_NAME,
                is_abstract=True,
                extends=[FastAPI.HTTPException],
                constructor=self._get_constructor(),
            )
            reference_to_class = source_file.add_class_declaration(class_declaration)
            reference_to_body = self._construct_pydantic_model(
                source_file=source_file, exception_class=reference_to_class
            )
            class_declaration.add_method(
                declaration=AST.FunctionDeclaration(
                    name="to_json_response",
                    signature=AST.FunctionSignature(return_type=AST.TypeHint(FastAPI.JSONResponse.REFERENCE)),
                    body=self._create_json_response_body_writer(reference_to_body=reference_to_body),
                )
            )

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
        self, source_file: SourceFile, exception_class: LocalClassReference
    ) -> AST.ClassReference:
        with PydanticModel(
            source_file=source_file,
            parent=exception_class,
            name=FernHTTPExceptionGenerator._BODY_CLASS_NAME,
        ) as body_pydantic_model:
            body_pydantic_model.add_field(
                PydanticField(
                    name=self._get_error_discriminant_field_name(),
                    type_hint=AST.TypeHint.optional(AST.TypeHint.str_()),
                    json_field_name=self._context.ir.constants_v_2.errors.error_discriminant.wire_value,
                    pascal_case_field_name=self._context.ir.constants_v_2.errors.error_discriminant.pascal_case,
                )
            )
            body_pydantic_model.add_field(
                PydanticField(
                    name=self._get_error_instance_id_field_name(),
                    type_hint=AST.TypeHint(
                        type=AST.ClassReference(
                            import_=AST.ReferenceImport(module=AST.Module.built_in("uuid")),
                            qualified_name_excluding_import=("UUID",),
                        )
                    ),
                    json_field_name=self._context.ir.constants_v_2.errors.error_instance_id_key.wire_value,
                    pascal_case_field_name=self._context.ir.constants_v_2.errors.error_instance_id_key.pascal_case,
                    default_factory=AST.Expression(
                        AST.Reference(
                            import_=AST.ReferenceImport(module=AST.Module.built_in("uuid")),
                            qualified_name_excluding_import=("uuid4",),
                        )
                    ),
                )
            )
            body_pydantic_model.add_field(
                PydanticField(
                    name=self._get_error_content_field_name(),
                    type_hint=AST.TypeHint.optional(AST.TypeHint.any()),
                    json_field_name=self._context.ir.constants_v_2.errors.error_content_key.wire_value,
                    pascal_case_field_name=self._context.ir.constants_v_2.errors.error_content_key.pascal_case,
                )
            )
            return body_pydantic_model.to_reference()

    def _get_error_discriminant_field_name(self) -> str:
        return self._context.ir.constants_v_2.errors.error_discriminant.snake_case

    def _get_error_instance_id_field_name(self) -> str:
        return self._context.ir.constants_v_2.errors.error_instance_id_key.snake_case

    def _get_error_content_field_name(self) -> str:
        return self._context.ir.constants_v_2.errors.error_content_key.snake_case

    def _create_json_response_body_writer(self, reference_to_body: AST.ClassReference) -> AST.CodeWriter:
        def write_body(writer: AST.NodeWriter) -> None:
            BODY_VARIABLE_NAME = "body"
            CONTENT_VARIABLE_NAME = "content"

            writer.write(f"{BODY_VARIABLE_NAME} = ")
            writer.write_node(
                AST.ClassInstantiation(
                    class_=reference_to_body,
                    kwargs=[
                        (
                            self._get_error_discriminant_field_name(),
                            AST.Expression("self." + self.FernHTTPException.NAME_MEMBER),
                        ),
                        (
                            self._get_error_content_field_name(),
                            AST.Expression(AST.CodeWriter(self._write_content_initializer)),
                        ),
                    ],
                )
            )
            writer.write_line(),

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

    def _write_content_initializer(self, writer: AST.NodeWriter) -> None:
        writer.write(f"self.{self.FernHTTPException.CONTENT_MEMBER} or ")
        writer.write_reference(
            reference=AST.Reference(
                qualified_name_excluding_import=("HTTPStatus",),
                import_=AST.ReferenceImport(module=AST.Module.built_in("http")),
            )
        )
        writer.write(f"(self.{self.FernHTTPException.STATUS_CODE_MEMBER}).phrase")
