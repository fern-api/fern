import textwrap
from fern_python.codegen import AST
from fern_python.external_dependencies import PydanticVersionCompatibility
from fern_python.generators.pydantic_model.field_metadata import FieldMetadata
from fern_python.pydantic_codegen import PydanticField, PydanticModel
from fern_python.source_file_factory import SourceFileFactory


def test_annotated_field_aliases_generation() -> None:
    """Test that use_annotated_field_aliases generates the correct annotated type syntax"""
    source_file = SourceFileFactory(should_format=True).create_snippet()

    # Mock field metadata getter
    def mock_field_metadata_getter() -> FieldMetadata:
        return FieldMetadata(reference=AST.ClassReference(qualified_name_excluding_import=("FieldMetadata",)))

    # Create PydanticModel with annotated field aliases enabled
    model = PydanticModel(
        source_file=source_file,
        name="TestModel",
        frozen=False,
        orm_mode=False,
        smart_union=False,
        version=PydanticVersionCompatibility.V2,
        is_pydantic_v2=AST.Expression("True"),
        universal_root_validator=lambda pre: AST.FunctionInvocation(
            function_definition=AST.Reference(qualified_name_excluding_import=("validator",))
        ),
        universal_field_validator=lambda field_name, pre: AST.FunctionInvocation(
            function_definition=AST.Reference(qualified_name_excluding_import=("field_validator",))
        ),
        require_optional_fields=False,
        update_forward_ref_function_reference=AST.Reference(qualified_name_excluding_import=("update_refs",)),
        field_metadata_getter=mock_field_metadata_getter,
        use_pydantic_field_aliases=True,  # This should be ignored when use_annotated_field_aliases=True
        use_annotated_field_aliases=True,  # Enable the new feature
    )

    # Add a field with an alias
    field = PydanticField(
        name="total_items",
        pascal_case_field_name="TotalItems",
        json_field_name="totalItems",
        type_hint=AST.TypeHint.int_(),
        description="Total number of items",
    )
    model.add_field(field)

    model.finish()

    # Generate the code
    generated_code = source_file.to_str()

    # Verify the generated code contains the annotated syntax
    assert "import typing_extensions" in generated_code
    assert "import pydantic" in generated_code
    assert "typing_extensions.Annotated" in generated_code
    assert 'pydantic.Field(\n            alias="totalItems"' in generated_code

    # Verify it does NOT contain the old syntax
    assert "total_items: int = pydantic.Field(" not in generated_code


def test_annotated_field_aliases_disabled() -> None:
    """Test that when disabled, it uses the traditional pydantic.Field syntax"""
    source_file = SourceFileFactory(should_format=True).create_snippet()

    # Mock field metadata getter
    def mock_field_metadata_getter() -> FieldMetadata:
        return FieldMetadata(reference=AST.ClassReference(qualified_name_excluding_import=("FieldMetadata",)))

    # Create PydanticModel with annotated field aliases disabled (default)
    model = PydanticModel(
        source_file=source_file,
        name="TestModel",
        frozen=False,
        orm_mode=False,
        smart_union=False,
        version=PydanticVersionCompatibility.V2,
        is_pydantic_v2=AST.Expression("True"),
        universal_root_validator=lambda pre: AST.FunctionInvocation(
            function_definition=AST.Reference(qualified_name_excluding_import=("validator",))
        ),
        universal_field_validator=lambda field_name, pre: AST.FunctionInvocation(
            function_definition=AST.Reference(qualified_name_excluding_import=("field_validator",))
        ),
        require_optional_fields=False,
        update_forward_ref_function_reference=AST.Reference(qualified_name_excluding_import=("update_refs",)),
        field_metadata_getter=mock_field_metadata_getter,
        use_pydantic_field_aliases=True,  # Traditional behavior
        use_annotated_field_aliases=False,  # Disabled
    )

    # Add a field with an alias
    field = PydanticField(
        name="total_items",
        pascal_case_field_name="TotalItems",
        json_field_name="totalItems",
        type_hint=AST.TypeHint.int_(),
        description="Total number of items",
    )
    model.add_field(field)

    model.finish()

    # Generate the code
    generated_code = source_file.to_str()

    # Verify the generated code uses traditional syntax
    assert "total_items: int = pydantic.Field(alias=\"totalItems\"" in generated_code

    # Verify it does NOT contain the annotated syntax
    assert "typing.Annotated[int, pydantic.Field(" not in generated_code


def test_annotated_field_aliases_only_v2() -> None:
    """Test that annotated field aliases only work with Pydantic v2"""
    source_file = SourceFileFactory(should_format=True).create_snippet()

    # Mock field metadata getter
    def mock_field_metadata_getter() -> FieldMetadata:
        return FieldMetadata(reference=AST.ClassReference(qualified_name_excluding_import=("FieldMetadata",)))

    # Create PydanticModel with annotated field aliases enabled but v1
    model = PydanticModel(
        source_file=source_file,
        name="TestModel",
        frozen=False,
        orm_mode=False,
        smart_union=False,
        version=PydanticVersionCompatibility.V1,  # v1, not v2
        is_pydantic_v2=AST.Expression("False"),
        universal_root_validator=lambda pre: AST.FunctionInvocation(
            function_definition=AST.Reference(qualified_name_excluding_import=("validator",))
        ),
        universal_field_validator=lambda field_name, pre: AST.FunctionInvocation(
            function_definition=AST.Reference(qualified_name_excluding_import=("field_validator",))
        ),
        require_optional_fields=False,
        update_forward_ref_function_reference=AST.Reference(qualified_name_excluding_import=("update_refs",)),
        field_metadata_getter=mock_field_metadata_getter,
        use_pydantic_field_aliases=True,
        use_annotated_field_aliases=True,  # Enabled but should be ignored for v1
    )

    # Add a field with an alias
    field = PydanticField(
        name="total_items",
        pascal_case_field_name="TotalItems",
        json_field_name="totalItems",
        type_hint=AST.TypeHint.int_(),
    )
    model.add_field(field)

    model.finish()

    # Generate the code
    generated_code = source_file.to_str()

    # Should fall back to traditional syntax for v1
    assert "total_items: int = pydantic.Field(alias=\"totalItems\"" in generated_code

    # Should NOT use annotated syntax for v1
    assert "typing.Annotated[int, pydantic.Field(" not in generated_code


def test_no_double_annotation() -> None:
    """Test that we don't get double annotations when use_annotated_field_aliases=True"""
    source_file = SourceFileFactory(should_format=True).create_snippet()

    # Mock field metadata getter
    def mock_field_metadata_getter() -> FieldMetadata:
        return FieldMetadata(reference=AST.ClassReference(qualified_name_excluding_import=("FieldMetadata",)))

    # Create PydanticModel with both flags set - this used to cause double annotation
    model = PydanticModel(
        source_file=source_file,
        name="TestModel",
        frozen=False,
        orm_mode=False,
        smart_union=False,
        version=PydanticVersionCompatibility.V2,
        is_pydantic_v2=AST.Expression("True"),
        universal_root_validator=lambda pre: AST.FunctionInvocation(
            function_definition=AST.Reference(qualified_name_excluding_import=("validator",))
        ),
        universal_field_validator=lambda field_name, pre: AST.FunctionInvocation(
            function_definition=AST.Reference(qualified_name_excluding_import=("field_validator",))
        ),
        require_optional_fields=False,
        update_forward_ref_function_reference=AST.Reference(qualified_name_excluding_import=("update_refs",)),
        field_metadata_getter=mock_field_metadata_getter,
        use_pydantic_field_aliases=False,  # This would trigger FieldMetadata approach
        use_annotated_field_aliases=True,  # This should override and use pydantic.Field approach
    )

    # Add a field with an alias
    field = PydanticField(
        name="total_items",
        pascal_case_field_name="TotalItems",
        json_field_name="totalItems",
        type_hint=AST.TypeHint.int_(),
    )
    model.add_field(field)

    model.finish()

    # Generate the code
    generated_code = source_file.to_str()

    # Should only have ONE level of Annotated, not nested
    assert "typing_extensions.Annotated" in generated_code
    assert 'pydantic.Field(\n            alias="totalItems"' in generated_code

    # Should NOT have double annotation (FieldMetadata inside pydantic.Field annotation)
    assert "FieldMetadata" not in generated_code
    assert generated_code.count("typing_extensions.Annotated") == 1