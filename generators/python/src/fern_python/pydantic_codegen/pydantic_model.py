from __future__ import annotations

import dataclasses
from types import TracebackType
from typing import Callable, List, Literal, Optional, Sequence, Tuple, Type, Union

from fern_python.codegen import AST, ClassParent, LocalClassReference, SourceFile
from fern_python.external_dependencies import Pydantic, PydanticVersionCompatibility
from fern_python.generators.pydantic_model.field_metadata import FieldMetadata
from pydantic import BaseModel

from .pydantic_field import PydanticField

# these are the properties that BaseModel already has
BASE_MODEL_PROPERTIES = set(dir(BaseModel))


class PydanticModel:
    VALIDATOR_FIELD_VALUE_PARAMETER_NAME = "v"
    VALIDATOR_VALUES_PARAMETER_NAME = "values"
    MODEL_PARAMETER_NAME = "model"

    _PARTIAL_CLASS_NAME = "Partial"

    def __init__(
        self,
        source_file: SourceFile,
        name: str,
        frozen: bool,
        orm_mode: bool,
        smart_union: bool,
        version: PydanticVersionCompatibility,
        is_pydantic_v2: AST.Expression,
        universal_root_validator: Callable[[bool], AST.FunctionInvocation],
        universal_field_validator: Callable[[str, bool], AST.FunctionInvocation],
        require_optional_fields: bool,
        update_forward_ref_function_reference: AST.Reference,
        field_metadata_getter: Callable[[], FieldMetadata],
        use_pydantic_field_aliases: bool,
        should_export: bool = True,
        base_models: Sequence[AST.ClassReference] = [],
        parent: Optional[ClassParent] = None,
        docstring: Optional[str] = None,
        snippet: Optional[str] = None,
        extra_fields: Optional[Literal["allow", "forbid"]] = None,
        pydantic_base_model: Optional[AST.ClassReference] = None,
        is_root_model: bool = False,
    ):
        self._source_file = source_file

        pydantic_base_model = pydantic_base_model or Pydantic.BaseModel()
        self._class_declaration = AST.ClassDeclaration(
            name=name,
            extends=base_models or [pydantic_base_model],
            docstring=AST.Docstring(docstring) if docstring is not None else None,
            snippet=snippet,
        )

        self._base_models = base_models or []
        self._local_class_reference = (parent or source_file).add_class_declaration(
            declaration=self._class_declaration, should_export=should_export
        )
        self._has_aliases = False
        self._version = version
        self._root_type: Optional[AST.TypeHint] = None
        self._fields: List[PydanticField] = []
        self._extra_fields = extra_fields
        self._frozen = frozen
        self._orm_mode = orm_mode
        self._smart_union = smart_union
        self.name = name
        self._require_optional_fields = require_optional_fields
        self._is_pydantic_v2 = is_pydantic_v2

        self._universal_root_validator = universal_root_validator
        self._universal_field_validator = universal_field_validator

        self._is_root_model = is_root_model

        self._update_forward_ref_function_reference = update_forward_ref_function_reference
        self._field_metadata_getter = field_metadata_getter
        self._use_pydantic_field_aliases = use_pydantic_field_aliases

    def to_reference(self) -> LocalClassReference:
        return self._local_class_reference

    def add_field(self, unsanitized_field: PydanticField) -> None:
        field = (
            dataclasses.replace(unsanitized_field, name=f"{unsanitized_field.name}_")
            if unsanitized_field.name in BASE_MODEL_PROPERTIES
            else unsanitized_field
        )

        # These are public fields so they should not start with an underscore
        # Fern will automatically add the underscore in the beginning for fields
        # that start with a number so we actually expect some public fields to
        # start with an underscore that we need to strip
        # This isn't just nice to have, Pydantic V2 also disallows underscore prefixes
        # Python also does not allow fields to start with a number, so we need a new prefix
        if field.name.startswith("_"):
            sanitized_name = "f_" + field.name.lstrip("_")
            prev_fields = field.__dict__
            del prev_fields["name"]
            field = PydanticField(
                **(field.__dict__),
                name=sanitized_name,
            )

        is_aliased = field.json_field_name != field.name
        self._has_aliases |= is_aliased

        default_value = (
            (
                AST.Expression("None")
                if unsanitized_field.type_hint.is_optional and self._require_optional_fields is False
                else None
            )
            if field.default_value is None
            else field.default_value
        )

        initializer = get_field_name_initializer(
            alias=field.json_field_name if (is_aliased and self._use_pydantic_field_aliases) else None,
            default_factory=field.default_factory,
            description=field.description,
            default=default_value,
        )

        if is_aliased and not self._use_pydantic_field_aliases:
            field_metadata = self._field_metadata_getter().get_instance()
            field_metadata.add_alias(field.json_field_name)

            aliased_type_hint = AST.TypeHint.annotated(
                type=field.type_hint,
                annotation=field_metadata.get_as_node(),
            )

            prev_fields = field.__dict__
            del prev_fields["type_hint"]
            field = PydanticField(
                **(field.__dict__),
                type_hint=aliased_type_hint,
            )

        self._class_declaration.add_class_var(
            AST.VariableDeclaration(name=field.name, type_hint=field.type_hint, initializer=initializer)
        )

        self._fields.append(field)

    def get_public_fields(self) -> List[PydanticField]:
        return self._fields

    def add_private_instance_field(
        self, name: str, type_hint: AST.TypeHint, default_factory: Optional[AST.Expression] = None
    ) -> None:
        if not name.startswith("_"):
            raise RuntimeError(
                f"Private pydantic field {name} in {self._class_declaration.name} does not start with an underscore"
            )
        self._class_declaration.add_class_var(
            AST.VariableDeclaration(
                name=name,
                type_hint=type_hint,
                initializer=AST.Expression(
                    AST.ClassInstantiation(
                        Pydantic.PrivateAttr(),
                        kwargs=[("default_factory", default_factory)] if default_factory is not None else [],
                    )
                ),
            )
        )

    def add_statement(self, statement: AST.AstNode) -> None:
        self._class_declaration.add_statement(statement)

    def add_class_var(self, name: str, type_hint: AST.TypeHint, initializer: Optional[AST.Expression] = None) -> None:
        self._class_declaration.add_class_var(
            AST.VariableDeclaration(
                name=name,
                type_hint=AST.TypeHint.class_var(class_var_type=type_hint),
                initializer=initializer,
            )
        )

    def add_method(
        self,
        declaration: AST.FunctionDeclaration,
        decorator: Optional[AST.ClassMethodDecorator] = None,
    ) -> AST.FunctionDeclaration:
        return self._class_declaration.add_method(
            declaration=declaration,
            decorator=decorator,
        )

    def add_ghost_reference(self, reference: AST.Reference) -> None:
        self._class_declaration.add_ghost_reference(reference)

    def add_field_validator(
        self,
        validator_name: str,
        field_name: str,
        field_type: AST.TypeHint,
        body: AST.CodeWriter,
        pre: bool = False,
    ) -> None:
        self._class_declaration.add_method(
            decorator=AST.ClassMethodDecorator.CLASS_METHOD,
            no_implicit_decorator=True,
            declaration=AST.FunctionDeclaration(
                name=validator_name,
                signature=AST.FunctionSignature(
                    parameters=[
                        AST.FunctionParameter(
                            name=PydanticModel.VALIDATOR_FIELD_VALUE_PARAMETER_NAME,
                            type_hint=field_type,
                        ),
                        AST.FunctionParameter(
                            name=PydanticModel.VALIDATOR_VALUES_PARAMETER_NAME,
                            type_hint=AST.TypeHint(type=self.get_reference_to_partial_class()),
                        ),
                    ],
                    return_type=field_type,
                ),
                body=body,
                decorators=[self._universal_field_validator(field_name, pre)],
            ),
        )

    def add_root_validator(
        self, *, validator_name: str, body: AST.CodeWriter, should_use_partial_type: bool = False, pre: bool = False
    ) -> None:
        value_type = (
            AST.TypeHint(type=self.get_reference_to_partial_class())
            if should_use_partial_type
            else AST.TypeHint.dict(AST.TypeHint.str_(), AST.TypeHint.any())
        )
        if self._version == PydanticVersionCompatibility.V1:
            self._class_declaration.add_method(
                decorator=AST.ClassMethodDecorator.CLASS_METHOD,
                no_implicit_decorator=True,
                declaration=AST.FunctionDeclaration(
                    name=validator_name,
                    signature=AST.FunctionSignature(
                        parameters=[
                            AST.FunctionParameter(
                                name=PydanticModel.VALIDATOR_VALUES_PARAMETER_NAME, type_hint=value_type
                            )
                        ],
                        return_type=value_type,
                    ),
                    body=body,
                    decorators=[self._universal_root_validator(pre)],
                ),
            )
        elif self._version == PydanticVersionCompatibility.V2:
            self._class_declaration.add_method(
                decorator=AST.ClassMethodDecorator.CLASS_METHOD,
                no_implicit_decorator=True,
                declaration=AST.FunctionDeclaration(
                    name=validator_name,
                    signature=AST.FunctionSignature(
                        parameters=[
                            AST.FunctionParameter(name=PydanticModel.MODEL_PARAMETER_NAME, type_hint=AST.TypeHint(self._local_class_reference))
                        ],
                        return_type=AST.TypeHint(self._local_class_reference),
                    ),
                    body=body,
                    decorators=[self._universal_root_validator(pre)],
                ),
            )

    def set_root_type_unsafe(self, root_type: AST.TypeHint, annotation: Optional[AST.Expression] = None) -> None:
        if self._version == PydanticVersionCompatibility.Both:
            raise RuntimeError("Overriding root types is only available in Pydantic v1 or v2")

        if self._root_type is not None:
            raise RuntimeError("__root__ was already added")

        self._root_type = root_type

        root_type_with_annotation = (
            AST.TypeHint.annotated(
                type=root_type,
                annotation=AST.Expression(annotation),
            )
            if annotation is not None
            else root_type
        )

        if self._version == PydanticVersionCompatibility.V1:
            self._class_declaration.add_statement(
                AST.VariableDeclaration(name="__root__", type_hint=root_type_with_annotation)
            )

        if self._version == PydanticVersionCompatibility.V2:
            self._class_declaration.add_statement(
                AST.VariableDeclaration(name="root", type_hint=root_type_with_annotation)
            )

    def get_root_type_unsafe(self) -> Optional[AST.TypeHint]:
        return self._root_type

    def add_inner_class(self, inner_class: AST.ClassDeclaration) -> None:
        self._class_declaration.add_class(declaration=inner_class)

    def finish(self) -> None:
        self._maybe_model_config()

    def add_partial_class(self) -> None:
        partial_class = AST.ClassDeclaration(
            name=PydanticModel._PARTIAL_CLASS_NAME,
            extends=[
                dataclasses.replace(
                    base_model,
                    qualified_name_excluding_import=base_model.qualified_name_excluding_import
                    + (PydanticModel._PARTIAL_CLASS_NAME,),
                )
                for base_model in self._base_models
            ]
            if len(self._base_models) > 0
            else [
                AST.ClassReference(
                    import_=AST.ReferenceImport(module=AST.Module.built_in(("typing",))),
                    qualified_name_excluding_import=("TypedDict",),
                )
            ],
        )

        for field in self.get_public_fields():
            partial_class.add_class_var(
                variable_declaration=AST.VariableDeclaration(
                    name=field.name,
                    type_hint=AST.TypeHint.not_required(field.type_hint),
                ),
            )

        self.add_inner_class(inner_class=partial_class)

    def get_reference_to_partial_class(self) -> AST.ClassReference:
        return AST.ClassReference(
            qualified_name_excluding_import=(self.name, PydanticModel._PARTIAL_CLASS_NAME),
            is_forward_reference=True,
        )

    def _get_v2_model_config(self) -> Optional[AST.Expression]:
        extra_fields = self._extra_fields
        config_kwargs: List[Tuple[str, AST.Expression]] = []
        if not self._is_root_model:
            if extra_fields == "allow" or extra_fields == "forbid":
                config_kwargs.append(("extra", AST.Expression(f'"{extra_fields}"')))
        if self._frozen:
            config_kwargs.append(("frozen", AST.Expression("True")))
        if self._orm_mode:
            config_kwargs.append(("from_attributes", AST.Expression("True")))

        def write_extras(writer: AST.NodeWriter) -> None:
            writer.write("model_config: ")
            writer.write_node(AST.TypeHint.class_var(AST.TypeHint(type=Pydantic.ConfigDict())))
            writer.write(" = ")
            writer.write_node(AST.Expression(AST.ClassInstantiation(Pydantic.ConfigDict(), kwargs=config_kwargs)))
            writer.write("  # type: ignore # Pydantic v2")

        if len(config_kwargs) > 0:
            return AST.Expression(AST.CodeWriter(write_extras))

        return None

    def _maybe_model_config(self) -> None:
        v1_config_class = self._get_v1_config_class()
        v2_model_config = self._get_v2_model_config()

        def write_extras(writer: AST.NodeWriter) -> None:
            if self._version == PydanticVersionCompatibility.Both:
                if v1_config_class is not None and v2_model_config is not None:
                    writer.write("if ")
                    writer.write_node(self._is_pydantic_v2)
                    writer.write_line(":")
                    with writer.indent():
                        writer.write_node(v2_model_config)
                    writer.write_newline_if_last_line_not()
                    writer.write_line("else:")
                    with writer.indent():
                        writer.write_node(v1_config_class)
                elif v1_config_class is not None or v2_model_config is not None:
                    writer.write("if ")
                    if v2_model_config is None:
                        writer.write("not ")
                    writer.write_node(self._is_pydantic_v2)
                    writer.write_line(":")
                    with writer.indent():
                        non_none_config: AST.AstNode = v1_config_class if v1_config_class is not None else v2_model_config  # type: ignore  # this is not None, by pyright says otherwise
                        writer.write_node(non_none_config)
            elif self._version == PydanticVersionCompatibility.V1 and v1_config_class is not None:
                writer.write_node(v1_config_class)
            elif self._version == PydanticVersionCompatibility.V2 and v2_model_config is not None:
                writer.write_node(v2_model_config)

        if (
            (
                self._version == PydanticVersionCompatibility.Both
                and (v1_config_class is not None or v2_model_config is not None)
            )
            or (self._version == PydanticVersionCompatibility.V1 and v1_config_class is not None)
            or (self._version == PydanticVersionCompatibility.V2 and v2_model_config is not None)
        ):
            self._class_declaration.add_expression(AST.Expression(AST.CodeWriter(write_extras)))

    def update_forward_refs(self) -> None:
        self._source_file.add_footer_expression(
            AST.Expression(
                AST.FunctionInvocation(
                    function_definition=self._update_forward_ref_function_reference,
                    args=[AST.Expression(self._local_class_reference)],
                )
            )
        )

    def update_forward_refs_for_given_model(self, given_model: AST.ClassReference) -> None:
        self._source_file.add_footer_expression(
            AST.Expression(
                AST.FunctionInvocation(
                    function_definition=self._update_forward_ref_function_reference,
                    args=[AST.Expression(given_model)],
                    kwargs=[
                        (
                            get_named_import_or_throw(self._local_class_reference),
                            AST.Expression(self._local_class_reference),
                        )
                    ],
                )
            )
        )

    def _get_v1_config_class(self) -> Optional[AST.ClassDeclaration]:
        config = AST.ClassDeclaration(name="Config")

        if self._frozen:
            config.add_class_var(
                AST.VariableDeclaration(
                    name="frozen",
                    initializer=AST.Expression("True"),
                )
            )

        if self._orm_mode:
            config.add_class_var(
                AST.VariableDeclaration(
                    name="orm_mode",
                    initializer=AST.Expression("True"),
                )
            )

        if self._smart_union:
            config.add_class_var(
                AST.VariableDeclaration(
                    name="smart_union",
                    initializer=AST.Expression("True"),
                )
            )

        if not self._is_root_model:
            if self._extra_fields == "forbid":
                config.add_class_var(
                    AST.VariableDeclaration(
                        name="extra",
                        initializer=Pydantic.Extra.forbid(),
                    )
                )
            elif self._extra_fields == "allow":
                config.add_class_var(
                    AST.VariableDeclaration(
                        name="extra",
                        initializer=Pydantic.Extra.allow(),
                    )
                )

        if len(config.class_vars) > 0:
            return config
        return None

    def __enter__(self) -> PydanticModel:
        return self

    def __exit__(
        self,
        exctype: Optional[Type[BaseException]],
        excinst: Optional[BaseException],
        exctb: Optional[TracebackType],
    ) -> None:
        self.finish()


def get_field_name_initializer(
    *,
    alias: Optional[str],
    default: Optional[AST.Expression],
    default_factory: Optional[AST.Expression],
    description: Optional[str],
) -> Union[AST.Expression, None]:
    if alias is None and default_factory is None and description is None:
        return default

    def write(writer: AST.NodeWriter) -> None:
        writer.write_reference(Pydantic.Field())
        writer.write("(")
        arg_present = False
        if alias is not None:
            arg_present = True
            writer.write(f'alias="{alias}"')
        if default is not None:
            if arg_present:
                writer.write(", ")
            arg_present = True
            writer.write("default=")
            writer.write_node(default)
        if default_factory is not None:
            if arg_present:
                writer.write(", ")
            arg_present = True
            writer.write("default_factory=")
            writer.write_node(default_factory)
        writer.write(")")
        if description is not None:
            writer.write_newline_if_last_line_not()
            writer.write_line('"""')
            writer.write_line(description)
            writer.write_line('"""')

    return AST.Expression(AST.CodeWriter(write))


def get_named_import_or_throw(reference: AST.Reference) -> str:
    if reference.import_ is None or reference.import_.named_import is None:
        raise RuntimeError("No named import defined on reference")
    return reference.import_.named_import
