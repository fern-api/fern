from fern_python.codegen import AST
from fern_python.source_file_factory import SourceFileFactory

VALUE = AST.TypeHint.union(AST.TypeHint.list(AST.TypeHint.str_()), AST.TypeHint.str_())


def _render(is_type_alias_type: bool) -> str:
    source_file = SourceFileFactory(should_format=True).create_snippet()
    source_file.add_declaration(
        AST.TypeAliasDeclaration(name="Value", type_hint=VALUE, is_type_alias_type=is_type_alias_type),
        should_export=False,
    )
    return source_file.to_str()


def test_type_alias_is_a_plain_assignment() -> None:
    assert _render(is_type_alias_type=False) == (
        "import typing\n\nValue = typing.Union[typing.List[str], str]\n"
    )


def test_recursive_type_alias_is_a_type_alias_type_at_runtime_only() -> None:
    assert _render(is_type_alias_type=True) == (
        "import typing\n"
        "\n"
        "import typing_extensions\n"
        "\n"
        "if typing.TYPE_CHECKING:\n"
        "    Value = typing.Union[typing.List[str], str]\n"
        "else:\n"
        "    Value = typing_extensions.TypeAliasType(\n"
        '        "Value", typing.Union[typing.List[str], str]\n'
        "    )\n"
    )
