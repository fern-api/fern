from fern_python.codegen import AST
from fern_python.source_file_factory import SourceFileFactory


def test_snippet_generator() -> None:
    snippet = SourceFileFactory.create_snippet()
    snippet.add_arbitrary_code(AST.CodeWriter("x = 42"))
    assert snippet.to_str() == "x = 42\n"
