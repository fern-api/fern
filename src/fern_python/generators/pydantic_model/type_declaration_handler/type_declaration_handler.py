from fern_python.codegen import AST
from fern_python.declaration_handler import DeclarationHandler
from fern_python.generated import ir_types
from fern_python.pydantic_codegen import PydanticModel

from .generate_enum import generate_enum
from .generate_union import generate_union


class TypeDeclarationHandler(DeclarationHandler[ir_types.TypeDeclaration]):
    def run(self) -> None:
        self._declaration.shape._visit(
            alias=self._generate_alias,
            enum=self._generate_enum,
            object=self._generate_object,
            union=self._generate_union,
        )

    def _generate_alias(self, alias: ir_types.AliasTypeDeclaration) -> None:
        self._context.source_file.add_declaration(
            AST.TypeAliasDeclaration(
                name=self._declaration.name.name,
                type_hint=self._context.get_type_hint_for_type_reference(alias.alias_of),
            )
        )

    def _generate_enum(self, enum: ir_types.EnumTypeDeclaration) -> None:
        generate_enum(name=self._declaration.name, enum=enum, source_file=self._context.source_file)

    def _generate_object(self, object: ir_types.ObjectTypeDeclaration) -> None:
        pydantic_model = PydanticModel(
            name=self._declaration.name.name,
            base_models=[self._context.get_class_reference_for_type_name(extended) for extended in object.extends],
        )

        for property in object.properties:
            pydantic_model.add_field(
                name=property.name.snake_case,
                type_hint=self._context.get_type_hint_for_type_reference(property.valueType),
                json_field_name=property.name.wire_value,
            )

        self._context.source_file.add_declaration(pydantic_model.finish())

    def _generate_union(self, union: ir_types.UnionTypeDeclaration) -> None:
        generate_union(name=self._declaration.name, union=union, source_file=self._context.source_file)
