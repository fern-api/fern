import fern.ir.resources as ir_types


def is_type_literal(type_reference: ir_types.TypeReference) -> bool:
    return type_reference.visit(
        container=lambda container_type: container_type.visit(
            list=lambda _: False,
            map=lambda _: False,
            optional=lambda _: False,
            set=lambda _: False,
            literal=lambda _: True
        ),
        named=lambda _: False,
        primitive=lambda _: False,
        unknown=lambda _: False,
    )