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

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Union

from ...context.sdk_generator_context import SdkGeneratorContext
from fern_python.codegen import AST
from fern_python.utils.name_resolver import get_wire_value, resolve_wire_name

import fern.ir.resources as ir_types


@dataclass
class _AccumulatedField:
    """One synthesized field, tracked during the merge before being emitted."""

    name: str
    # Dedups hints when the same IR type appears in multiple variants; dict
    # keys preserve first-seen order so emission is stable across runs.
    inner_type_hints: Dict[str, AST.TypeHint] = field(default_factory=dict)
    raw_type: Optional[ir_types.TypeReference] = None
    # The key under which ``raw_type`` was first recorded — used to detect a
    # conflicting source from a later variant without re-serializing IR.
    raw_type_key: Optional[str] = None
    raw_name: str = ""
    docs: Optional[str] = None


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
    accumulator: Dict[str, _AccumulatedField] = {}

    for extended in union_decl.extends:
        for prop in context.pydantic_generator_context.get_all_properties_including_extensions(extended.type_id):
            _add_object_property(prop, context, deconflict, accumulator)

    for base_prop in union_decl.base_properties:
        _add_object_property(base_prop, context, deconflict, accumulator)

    for single_union_type in union_decl.types:
        single_union_type.shape.visit(
            same_properties_as_object=lambda type_name: _add_referenced_object_properties(
                type_name, context, deconflict, accumulator
            ),
            single_property=lambda single_prop: _add_single_property(single_prop, context, deconflict, accumulator),
            no_properties=lambda: None,
        )

    discriminator_wire = get_wire_value(union_decl.discriminant)
    discriminator_param_name = _python_name(union_decl.discriminant, deconflict)
    discriminator_values = [get_wire_value(t.discriminant_value) for t in union_decl.types]
    discriminator_inner_hint = _build_literal_union_type_hint(discriminator_values)
    _accumulate(
        accumulator,
        discriminator_wire,
        discriminator_param_name,
        discriminator_inner_hint,
        inner_hint_key=f"__discriminator__:{','.join(sorted(discriminator_values))}",
        raw_type=None,
        docs=None,
    )

    return [_emit(field_) for field_ in accumulator.values()]


def _accumulate(
    accumulator: Dict[str, _AccumulatedField],
    wire: str,
    param_name: str,
    inner_hint: AST.TypeHint,
    inner_hint_key: str,
    raw_type: Optional[ir_types.TypeReference],
    docs: Optional[str],
) -> None:
    existing = accumulator.get(wire)
    if existing is None:
        accumulator[wire] = _AccumulatedField(
            name=param_name,
            inner_type_hints={inner_hint_key: inner_hint},
            raw_type=raw_type,
            raw_type_key=inner_hint_key if raw_type is not None else None,
            raw_name=wire,
            docs=docs,
        )
        return

    existing.inner_type_hints.setdefault(inner_hint_key, inner_hint)

    if existing.raw_type is not None and raw_type is not None and existing.raw_type_key != inner_hint_key:
        # Conflicting source types — drop raw_type so the JSON-body emitter
        # falls back to plain interpolation rather than a per-type coercion.
        existing.raw_type = None
        existing.raw_type_key = None


def _emit(acc: _AccumulatedField) -> AST.NamedFunctionParameter:
    hints = list(acc.inner_type_hints.values())
    inner = hints[0] if len(hints) == 1 else AST.TypeHint.union(*hints)
    type_hint = inner if inner.is_optional else AST.TypeHint.optional(inner)
    return AST.NamedFunctionParameter(
        name=acc.name,
        docs=acc.docs,
        type_hint=type_hint,
        initializer=AST.Expression("None"),
        raw_type=acc.raw_type,
        raw_name=acc.raw_name,
    )


def _add_object_property(
    prop: ir_types.ObjectProperty,
    context: SdkGeneratorContext,
    deconflict: Set[str],
    accumulator: Dict[str, _AccumulatedField],
) -> None:
    wire = get_wire_value(prop.name)
    unwrapped_tr = context.unwrap_optional_type_reference(prop.value_type)
    inner_hint = context.pydantic_generator_context.get_type_hint_for_type_reference(
        unwrapped_tr,
        in_endpoint=True,
    )
    _accumulate(
        accumulator,
        wire,
        _python_name(prop.name, deconflict),
        inner_hint,
        inner_hint_key=unwrapped_tr.json(),
        raw_type=unwrapped_tr,
        docs=prop.docs,
    )


def _add_referenced_object_properties(
    type_name: ir_types.DeclaredTypeName,
    context: SdkGeneratorContext,
    deconflict: Set[str],
    accumulator: Dict[str, _AccumulatedField],
) -> None:
    for prop in context.pydantic_generator_context.get_all_properties_including_extensions(type_name.type_id):
        _add_object_property(prop, context, deconflict, accumulator)


def _add_single_property(
    single_prop: ir_types.SingleUnionTypeProperty,
    context: SdkGeneratorContext,
    deconflict: Set[str],
    accumulator: Dict[str, _AccumulatedField],
) -> None:
    wire = get_wire_value(single_prop.name)
    unwrapped_tr = context.unwrap_optional_type_reference(single_prop.type)
    inner_hint = context.pydantic_generator_context.get_type_hint_for_type_reference(
        unwrapped_tr,
        in_endpoint=True,
    )
    _accumulate(
        accumulator,
        wire,
        _python_name(single_prop.name, deconflict),
        inner_hint,
        inner_hint_key=unwrapped_tr.json(),
        raw_type=unwrapped_tr,
        docs=None,
    )


def _python_name(wire_or_name: Union[str, ir_types.NameAndWireValue], deconflict: Set[str]) -> str:
    resolved = resolve_wire_name(wire_or_name).snake_case.safe_name
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
