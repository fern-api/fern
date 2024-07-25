from fern_python.generators.context import PydanticGeneratorContext
from fern_python.generators.pydantic_model import (
    AliasSnippetGenerator,
    DiscriminatedUnionSnippetGenerator,
    EnumSnippetGenerator,
    ObjectSnippetGenerator,
)
from fern_python.generators.pydantic_model.type_declaration_handler.undiscriminated_union_generator import (
    UndiscriminatedUnionSnippetGenerator,
)
from fern_python.snippet import SnippetWriter, TypeDeclarationSnippetGenerator


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

    type_declaration_snippet_generator = TypeDeclarationSnippetGenerator(
        alias=lambda example, as_request, use_typeddict_request: AliasSnippetGenerator(
            snippet_writer=snippet_writer,
            example=example,
            as_request=as_request,
            use_typeddict_request=use_typeddict_request,
        ).generate_snippet(),
        enum=lambda name, example: EnumSnippetGenerator(
            snippet_writer=snippet_writer, name=name, example=example, use_str_enums=use_str_enums
        ).generate_snippet(),
        object=lambda name, example, as_request, use_typeddict_request: ObjectSnippetGenerator(
            snippet_writer=snippet_writer,
            name=name,
            example=example,
            as_request=as_request,
            use_typeddict_request=use_typeddict_request,
        ).generate_snippet(),
        discriminated_union=lambda name, example, as_request, use_typeddict_request: DiscriminatedUnionSnippetGenerator(
            snippet_writer=snippet_writer,
            name=name,
            example=example,
            as_request=as_request,
            use_typeddict_request=use_typeddict_request,
        ).generate_snippet(),
        undiscriminated_union=lambda name, example, as_request, use_typeddict_request: UndiscriminatedUnionSnippetGenerator(
            snippet_writer=snippet_writer,
            name=name,
            example=example,
            as_request=as_request,
            use_typeddict_request=use_typeddict_request,
        ).generate_snippet(),
    )

    snippet_writer._type_declaration_snippet_generator = type_declaration_snippet_generator

    return snippet_writer
