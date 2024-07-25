from typing import Optional

from fern_python.codegen import AST


class FieldMetadata:
    # TODO: Add more metadata, like default value, etc.
    # This is primarily used for TypedDicts as you cannot
    # alias fields in TypedDicts natively.
    #
    # NOTE: This should mirror FieldMetadata within serialization_utilities.py
    def __init__(self, *, reference: AST.ClassReference) -> None:
        self.reference = reference

    def get_instance(self) -> "FieldMetadataInstance":
        return FieldMetadata.FieldMetadataInstance(self.reference)

    class FieldMetadataInstance:
        alias: Optional[str]

        def __init__(self, field_metdata: AST.ClassReference) -> None:
            self.field_metdata = field_metdata

        def add_alias(self, alias: Optional[str]) -> None:
            self.alias = alias

        def get_as_node(self) -> AST.Expression:
            metadata_kwargs = []
            if self.alias is not None:
                metadata_kwargs.append(
                    (
                        "alias",
                        AST.Expression(f'"{self.alias}"'),
                    )
                )

            return AST.Expression(
                AST.ClassInstantiation(
                    class_=self.field_metdata,
                    kwargs=metadata_kwargs,
                )
            )
