from __future__ import annotations

import dataclasses
from types import TracebackType
from typing import Iterable, List, Literal, Optional, Sequence, Tuple, Type, Union

from fern_python.codegen import AST, ClassParent, LocalClassReference, SourceFile
from fern_python.external_dependencies import Pydantic, PydanticVersionCompatibility
from pydantic import BaseModel

from .pydantic_field import PydanticField

# these are the properties that BaseModel already has
BASE_MODEL_PROPERTIES = set(dir(BaseModel))


class PydanticModel:
    VALIDATOR_FIELD_VALUE_PARAMETER_NAME = "v"
    VALIDATOR_VALUES_PARAMETER_NAME = "values"

    _PARTIAL_CLASS_NAME = "Partial"

    def __init__(
        self,
        source_file: SourceFile,
        name: str,
        frozen: bool,
        orm_mode: bool,
        smart_union: bool,
        version: PydanticVersionCompatibility,
        require_optional_fields: bool,
        should_export: bool = True,
        base_models: Sequence[AST.ClassReference] = [],
        parent: Optional[ClassParent] = None,
        docstring: Optional[str] = None,
        snippet: Optional[str] = None,
        extra_fields: Optional[Literal["allow", "forbid"]] = None,
        pydantic_base_model: Optional[AST.ClassReference] = None,
    ):
        self._source_file = source_file

        pydantic_base_model = pydantic_base_model or Pydantic.BaseModel(version)
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
        self.json_encoders: List[Tuple[AST.Expression, AST.Expression]] = []
        self._require_optional_fields = require_optional_fields

    def to_reference(self) -> LocalClassReference:
        return self._local_class_reference

    def add_field(self, unsanitized_field: PydanticField) -> None:
        field = (
            dataclasses.replace(unsanitized_field, name=f"{unsanitized_field.name}_")
            if unsanitized_field.name in BASE_MODEL_PROPERTIES
            else unsanitized_field
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
            alias=field.json_field_name if is_aliased else None,
            default_factory=field.default_factory,
            description=field.description,
            default=default_value,
            version=self._version,
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
                        Pydantic.PrivateAttr(self._version),
                        kwargs=[("default_factory", default_factory)] if default_factory is not None else [],
                    )
                ),
            )
        )

    def add_class_var(self, name: str, type_hint: AST.TypeHint, initializer: Optional[AST.Expression] = None) -> None:
        self._class_declaration.add_class_var(
            AST.VariableDeclaration(
                name=name,
                type_hint=AST.TypeHint.class_var(class_var_type=type_hint),
                initializer=initializer,
            )
        )

    def set_root_type(self, root_type: AST.TypeHint, annotation: Optional[AST.Expression] = None) -> None:
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

        self._class_declaration.add_statement(
            AST.VariableDeclaration(name="__root__", type_hint=root_type_with_annotation)
        )

    def get_root_type(self) -> Optional[AST.TypeHint]:
        return self._root_type

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
                decorators=[Pydantic.validator(self._version, field_name, pre)],
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
        self._class_declaration.add_method(
            decorator=AST.ClassMethodDecorator.CLASS_METHOD,
            no_implicit_decorator=True,
            declaration=AST.FunctionDeclaration(
                name=validator_name,
                signature=AST.FunctionSignature(
                    parameters=[
                        AST.FunctionParameter(name=PydanticModel.VALIDATOR_VALUES_PARAMETER_NAME, type_hint=value_type)
                    ],
                    return_type=value_type,
                ),
                body=body,
                decorators=[Pydantic.root_validator(pre=pre, version=self._version)],
            ),
        )

    def add_json_encoder(self, key: AST.Expression, value: AST.Expression) -> None:
        self.json_encoders.append((key, value))

    def add_inner_class(self, inner_class: AST.ClassDeclaration) -> None:
        self._class_declaration.add_class(declaration=inner_class)

    def finish(self) -> None:
        self._add_config_class()

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

    def update_forward_refs(self, localns: Iterable[AST.ClassReference] = []) -> None:
        self._source_file.add_footer_expression(
            AST.Expression(
                AST.FunctionInvocation(
                    function_definition=dataclasses.replace(
                        self._local_class_reference,
                        qualified_name_excluding_import=(
                            *self._local_class_reference.qualified_name_excluding_import,
                            "update_forward_refs",
                        ),
                    ),
                    kwargs=sorted(
                        [(get_named_import_or_throw(reference), AST.Expression(reference)) for reference in localns],
                        # sort by name for consistency
                        key=lambda kwarg: kwarg[0],
                    ),
                )
            )
        )

    def _add_config_class(self) -> None:
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

        if self._has_aliases or len(self._base_models) > 0:
            config.add_class_var(
                AST.VariableDeclaration(
                    name="allow_population_by_field_name",
                    initializer=AST.Expression("True"),
                )
            )
            config.add_class_var(
                AST.VariableDeclaration(
                    name="populate_by_name",
                    initializer=AST.Expression("True"),
                )
            )

        if self._extra_fields == "forbid":
            config.add_class_var(
                AST.VariableDeclaration(
                    name="extra",
                    initializer=Pydantic.Extra.forbid(self._version),
                )
            )
        elif self._extra_fields == "allow":
            config.add_class_var(
                AST.VariableDeclaration(
                    name="extra",
                    initializer=Pydantic.Extra.allow(self._version),
                )
            )

        if len(self.json_encoders) > 0:
            config.add_class_var(
                AST.VariableDeclaration(
                    name="json_encoders",
                    initializer=AST.Expression(
                        AST.DictionaryInstantiation(entries=self.json_encoders),
                    ),
                )
            )

        if len(config.class_vars) > 0:
            self._class_declaration.add_class(declaration=config)

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
    version: PydanticVersionCompatibility,
    alias: Optional[str],
    default: Optional[AST.Expression],
    default_factory: Optional[AST.Expression],
    description: Optional[str],
) -> Union[AST.Expression, None]:
    if alias is None and default_factory is None and description is None:
        return default

    def write(writer: AST.NodeWriter) -> None:
        writer.write_reference(Pydantic.Field(version=version))
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
