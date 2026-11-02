from fern_python.codegen import AST
from fern_python.codegen.dependency_manager import DependencyManager
from fern_python.codegen.reference_resolver_impl import ReferenceResolverImpl
from fern_python.codegen.source_file import SourceFileImpl

VALUE = AST.TypeHint.union(AST.TypeHint.list(AST.TypeHint.str_()), AST.TypeHint.str_())


def _render(is_type_alias_type: bool) -> str:
    # Unformatted, so a formatter upgrade can't change the expected text.
    source_file = SourceFileImpl(
        module_path=(),
        reference_resolver=ReferenceResolverImpl(module_path_of_source_file=()),
        dependency_manager=DependencyManager(),
        should_format=False,
        should_include_header=False,
    )
    source_file.add_declaration(
        AST.TypeAliasDeclaration(name="Value", type_hint=VALUE, is_type_alias_type=is_type_alias_type),
        should_export=False,
    )
    return source_file.to_str()


def test_type_alias_is_a_plain_assignment() -> None:
    assert _render(is_type_alias_type=False) == "import typing\nValue = typing.Union[typing.List[str], str]\n"


def test_recursive_type_alias_is_a_type_alias_type_at_runtime_only() -> None:
    assert _render(is_type_alias_type=True) == (
        "import typing\n"
        "import typing_extensions\n"
        "if typing.TYPE_CHECKING:\n"
        "    Value = typing.Union[typing.List[str], str]\n"
        "else:\n"
        '    Value = typing_extensions.TypeAliasType("Value", typing.Union[typing.List[str], str])\n'
    )
