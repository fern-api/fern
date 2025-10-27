import fern.ir.resources as ir_types


def is_optional_or_nullable(type_reference: ir_types.TypeReference) -> bool:
    """
    Check if a TypeReference is optional or nullable.
    
    Returns True if the type is wrapped in an optional or nullable container,
    False otherwise.
    """
    value_type = type_reference.get_as_union()
    return value_type.type == "container" and (
        value_type.container.get_as_union().type == "optional"
        or value_type.container.get_as_union().type == "nullable"
    )
