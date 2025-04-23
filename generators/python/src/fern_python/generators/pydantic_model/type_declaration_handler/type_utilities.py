import fern.ir.resources as ir_types  # type: ignore[import-untyped]


def declared_type_name_to_named_type(declared_type_name: ir_types.DeclaredTypeName) -> ir_types.NamedType:
    return ir_types.NamedType(
        type_id=declared_type_name.type_id,
        fern_filepath=declared_type_name.fern_filepath,
        name=declared_type_name.name,
    )
