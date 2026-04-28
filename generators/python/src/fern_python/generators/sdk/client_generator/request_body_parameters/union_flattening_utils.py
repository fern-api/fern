"""Synthesize a flat list of function parameters from a discriminated-union IR.

When ``flatten_union_request_bodies`` is enabled and an endpoint's referenced
request body resolves to a discriminated ``union``, we collapse all variants'
fields into a single set of kwargs (Stripe-style). The discriminator becomes a
``Union[Literal[...], ...]`` of all variant values. Fields that appear in more
than one variant are deduped by wire-name; conflicting types are unioned at the
type-hint level (the IR has no native union ``TypeReference``, so the resulting
parameter has ``raw_type=None`` and falls back to plain dict interpolation in
the generated JSON body).
"""

from typing import Dict, List, Optional, Tuple

from ...context.sdk_generator_context import SdkGeneratorContext
from fern_python.codegen import AST
from fern_python.utils.name_resolver import get_name_from_wire_value, get_wire_value, resolve_name

import fern.ir.resources as ir_types


def build_flattened_union_parameters(
    union_decl: ir_types.UnionTypeDeclaration,
    context: SdkGeneratorContext,
    names_to_deconflict: Optional[List[str]] = None,
) -> List[AST.NamedFunctionParameter]:
    """Walk the union's variants and produce a flat kwargs parameter list.

    Order: union ``base_properties`` first, then per-variant fields (in variant
    declaration order), then the synthesized discriminator. Discriminator goes
    last so it shows up consistently in IDE hover regardless of variant count.
    """
    deconflict = set(names_to_deconflict or [])

    # Map of wire-name -> (NamedFunctionParameter, source_TypeReference). We
    # keep the TypeReference around so we can detect collisions and either
    # widen the type hint (different TypeReferences → Union) or skip the dup
    # (same TypeReference → keep first).
    accumulator: Dict[str, Tuple[AST.NamedFunctionParameter, Optional[ir_types.TypeReference]]] = {}

    def add_property_from_object(prop: ir_types.ObjectProperty) -> None:
        wire = get_wire_value(prop.name)
        param_name = _python_name(prop.name, deconflict)
        type_hint = context.pydantic_generator_context.get_type_hint_for_type_reference(
            prop.value_type,
            in_endpoint=True,
        )
        param = AST.NamedFunctionParameter(
            name=param_name,
            docs=prop.docs,
            type_hint=type_hint if type_hint.is_optional else AST.TypeHint.optional(type_hint),
            initializer=AST.Expression("None"),
            raw_type=prop.value_type,
            raw_name=wire,
        )
        _accumulate(accumulator, wire, param, prop.value_type, context)

    def add_synthetic_property(
        wire_name: str,
        param_name: str,
        type_hint: AST.TypeHint,
    ) -> None:
        param = AST.NamedFunctionParameter(
            name=param_name,
            type_hint=type_hint if type_hint.is_optional else AST.TypeHint.optional(type_hint),
            initializer=AST.Expression("None"),
            raw_type=None,
            raw_name=wire_name,
        )
        _accumulate(accumulator, wire_name, param, None, context)

    for base_prop in union_decl.base_properties:
        add_property_from_object(base_prop)

    for single_union_type in union_decl.types:
        single_union_type.shape.visit(
            same_properties_as_object=lambda type_name: _add_object_properties(
                type_name, context, add_property_from_object
            ),
            single_property=lambda single_prop: _add_single_property(
                single_prop, context, deconflict, accumulator
            ),
            no_properties=lambda: None,
        )

    discriminator_wire = get_wire_value(union_decl.discriminant)
    discriminator_param_name = _python_name(union_decl.discriminant, deconflict)
    discriminator_type_hint = _build_literal_union_type_hint(
        [get_wire_value(t.discriminant_value) for t in union_decl.types]
    )
    add_synthetic_property(discriminator_wire, discriminator_param_name, discriminator_type_hint)

    return [param for (param, _) in accumulator.values()]


def _accumulate(
    accumulator: Dict[str, Tuple[AST.NamedFunctionParameter, Optional[ir_types.TypeReference]]],
    wire: str,
    param: AST.NamedFunctionParameter,
    type_ref: Optional[ir_types.TypeReference],
    context: SdkGeneratorContext,
) -> None:
    """Insert a parameter; on name collision, merge type hints."""
    if wire not in accumulator:
        accumulator[wire] = (param, type_ref)
        return

    existing_param, existing_ref = accumulator[wire]
    if existing_ref is not None and type_ref is not None and _type_references_equal(existing_ref, type_ref):
        # Same wire name + same source type → first one wins.
        return

    merged_hint = _union_optional_hints(existing_param.type_hint, param.type_hint)
    merged = AST.NamedFunctionParameter(
        name=existing_param.name,
        docs=existing_param.docs,
        type_hint=merged_hint,
        initializer=AST.Expression("None"),
        # Conflict means we can't reliably resolve a single TypeReference at
        # serialization time → drop raw_type and let json-body emit the value
        # via plain interpolation.
        raw_type=None,
        raw_name=existing_param.raw_name,
    )
    accumulator[wire] = (merged, None)


def _union_optional_hints(a: AST.TypeHint, b: AST.TypeHint) -> AST.TypeHint:
    inner_a = _strip_optional(a)
    inner_b = _strip_optional(b)
    return AST.TypeHint.optional(AST.TypeHint.union(inner_a, inner_b))


def _strip_optional(hint: AST.TypeHint) -> AST.TypeHint:
    """Best-effort strip of an outer Optional[...] wrapping."""
    if hint.is_optional and len(hint.type_parameters) == 1:
        return hint.type_parameters[0].type_hint
    return hint


def _type_references_equal(a: ir_types.TypeReference, b: ir_types.TypeReference) -> bool:
    """Cheap equality check to avoid spurious collisions on the same shared property."""
    return a.json() == b.json()


def _add_object_properties(
    type_name: ir_types.DeclaredTypeName,
    context: SdkGeneratorContext,
    add_property: "callable[[ir_types.ObjectProperty], None]",  # type: ignore[type-arg]
) -> None:
    for prop in context.pydantic_generator_context.get_all_properties_including_extensions(type_name.type_id):
        add_property(prop)


def _add_single_property(
    single_prop: ir_types.SingleUnionTypeProperty,
    context: SdkGeneratorContext,
    deconflict: set,
    accumulator: Dict[str, Tuple[AST.NamedFunctionParameter, Optional[ir_types.TypeReference]]],
) -> None:
    wire = get_wire_value(single_prop.name)
    param_name = _python_name(single_prop.name, deconflict)
    type_hint = context.pydantic_generator_context.get_type_hint_for_type_reference(
        single_prop.type,
        in_endpoint=True,
    )
    param = AST.NamedFunctionParameter(
        name=param_name,
        type_hint=type_hint if type_hint.is_optional else AST.TypeHint.optional(type_hint),
        initializer=AST.Expression("None"),
        raw_type=single_prop.type,
        raw_name=wire,
    )
    _accumulate(accumulator, wire, param, single_prop.type, context)


def _python_name(wire_or_name, deconflict: set) -> str:  # type: ignore[no-untyped-def]
    resolved = resolve_name(get_name_from_wire_value(wire_or_name)).snake_case.safe_name
    if resolved in deconflict:
        return f"request_{resolved}"
    return resolved


def _build_literal_union_type_hint(values: List[str]) -> AST.TypeHint:
    """Build ``Union[Literal["a"], Literal["b"], ...]`` for the discriminator."""
    if not values:
        return AST.TypeHint.str_()
    if len(values) == 1:
        return AST.TypeHint.literal(AST.Expression(f'"{values[0]}"'))
    return AST.TypeHint.union(*[AST.TypeHint.literal(AST.Expression(f'"{v}"')) for v in values])
