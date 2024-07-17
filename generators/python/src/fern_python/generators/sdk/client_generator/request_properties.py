import fern.ir.resources as ir_types


def request_property_to_name(request_property: ir_types.RequestPropertyValue) -> str:
    return request_property.get_as_union().name.name.snake_case.safe_name
