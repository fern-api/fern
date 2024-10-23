from fern_python.generators.context import PydanticGeneratorContext
from fern_python.generators.pydantic_model.type_declaration_handler import (
    TypeDeclarationSnippetGeneratorBuilder,
)
from fern_python.snippet import SnippetWriter


def build_snippet_writer(
    *, context: PydanticGeneratorContext, improved_imports: bool = False, use_str_enums: bool = False
) -> SnippetWriter:
    """
    Builds a new SnippetWriter. Using this function is preferred over
    the SnippetWriter constructor due to the two-phase construction
    process required between the SnippetWriter and TypeDeclarationSnippetGenerator.
    """
    snippet_writer = SnippetWriter(
        context=context,
        improved_imports=improved_imports,
    )

    type_declaration_snippet_generator = TypeDeclarationSnippetGeneratorBuilder(
        context=context,
        snippet_writer=snippet_writer,
    ).get_generator()

    snippet_writer._type_declaration_snippet_generator = type_declaration_snippet_generator

    return snippet_writer
