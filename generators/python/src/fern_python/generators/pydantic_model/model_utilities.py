from typing import Dict

import fern.ir.resources as ir_types


def can_tr_be_fern_model(tr: ir_types.TypeReference, types: Dict[ir_types.TypeId, ir_types.TypeDeclaration]) -> bool:
    return tr.visit(
        named=lambda nt: can_be_fern_model(types[nt.type_id].shape, types),
        container=lambda ct: ct.visit(
            list_=lambda list_tr: can_tr_be_fern_model(list_tr, types),
            map_=lambda mt: can_tr_be_fern_model(mt.key_type, types) or can_tr_be_fern_model(mt.value_type, types),
            optional=lambda optional_tr: can_tr_be_fern_model(optional_tr, types),
            nullable=lambda nullable_tr: can_tr_be_fern_model(nullable_tr, types),
            set_=lambda set_tr: can_tr_be_fern_model(set_tr, types),
            literal=lambda _: False,
        ),
        primitive=lambda _: False,
        unknown=lambda: False,
    )


def can_be_fern_model(type_: ir_types.Type, types: Dict[ir_types.TypeId, ir_types.TypeDeclaration]) -> bool:
    return type_.visit(
        alias=lambda atd: atd.resolved_type.visit(
            named=lambda nt: nt.shape.visit(
                enum=lambda: False,
                object=lambda: True,
                union=lambda: True,
                undiscriminated_union=lambda: True,
            ),
            container=lambda ct: ct.visit(
                list_=lambda list_tr: can_tr_be_fern_model(list_tr, types),
                map_=lambda mt: can_tr_be_fern_model(mt.key_type, types) or can_tr_be_fern_model(mt.value_type, types),
                optional=lambda optional_tr: can_tr_be_fern_model(optional_tr, types),
                nullable=lambda nullable_tr: can_tr_be_fern_model(nullable_tr, types),
                set_=lambda set_tr: can_tr_be_fern_model(set_tr, types),
                literal=lambda _: False,
            ),
            primitive=lambda _: False,
            unknown=lambda: False,
        ),
        enum=lambda _: False,
        object=lambda _: True,
        union=lambda _: True,
        undiscriminated_union=lambda _: True,
    )
