import fern.ir.resources as ir_types


def request_property_to_name(request_property: ir_types.RequestPropertyValue) -> str:
    return request_property.get_as_union().name.name.snake_case.safe_name


def retrieve_pagination_default(type_reference: ir_types.TypeReference) -> int:
    default_value = None
    union = type_reference.get_as_union()
    if union.type == "primitive":
        maybe_v2_scheme = union.primitive.v_2
        if maybe_v2_scheme is not None:
            default_value = maybe_v2_scheme.visit(
                integer=lambda it: it.default,
                double=lambda _: None,
                string=lambda _: None,
                boolean=lambda _: None,
                long_=lambda _: None,
                big_integer=lambda _: None,
                uint=lambda _: None,
                uint_64=lambda _: None,
                date=lambda _: None,
                date_time=lambda _: None,
                uuid_=lambda _: None,
                base_64=lambda _: None,
                float_=lambda _: None,
            )
    elif union.type == "container":
        default_value = union.container.visit(
            literal=lambda _: None,
            list_=lambda _: None,
            set_=lambda _: None,
            nullable=lambda nullable: retrieve_pagination_default(nullable),
            optional=lambda opt: retrieve_pagination_default(opt),
            map_=lambda _: None,
        )

    return default_value if default_value is not None else 1
