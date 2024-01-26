from fern_python.generators.context import PydanticGeneratorContext
from fern_python.generators.pydantic_model import (
    AliasSnippetGenerator,
    DiscriminatedUnionSnippetGenerator,
    EnumSnippetGenerator,
    ObjectSnippetGenerator,
)
from fern_python.snippet import SnippetWriter, TypeDeclarationSnippetGenerator


def build_snippet_writer(context: PydanticGeneratorContext) -> SnippetWriter:
    """
    Builds a new SnippetWriter. Using this function is preferred over
    the SnippetWriter constructor due to the two-phase construction
    process required between the SnippetWriter and TypeDeclarationSnippetGenerator.
    """
    snippet_writer = SnippetWriter(
        context=context,
    )

    type_declaration_snippet_generator = TypeDeclarationSnippetGenerator(
        alias=lambda example: AliasSnippetGenerator(
            snippet_writer=snippet_writer,
            example=example,
        ).generate_snippet(),
        enum=lambda name, example: EnumSnippetGenerator(
            snippet_writer=snippet_writer,
            name=name,
            example=example,
        ).generate_snippet(),
        object=lambda name, example: ObjectSnippetGenerator(
            snippet_writer=snippet_writer,
            name=name,
            example=example,
        ).generate_snippet(),
        discriminated_union=lambda name, example: DiscriminatedUnionSnippetGenerator(
            snippet_writer=snippet_writer,
            name=name,
            example=example,
        ).generate_snippet(),
    )

    snippet_writer._type_declaration_snippet_generator = type_declaration_snippet_generator

    return snippet_writer
