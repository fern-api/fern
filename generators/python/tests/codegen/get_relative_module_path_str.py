from fern_python.codegen.imports_manager import get_relative_module_path_str


def test_get_relative_module_path_str() -> None:
    from_module = ("resources", "problem", "types", "create_problem_request")
    to_module = ("resources", "commons", "types", "language")
    expected = "...commons.types.language"
    actual = get_relative_module_path_str(from_module, to_module)
    assert expected == actual
