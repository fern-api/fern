from typing import Callable

from ...context.pydantic_generator_context import PydanticGeneratorContext
from ..custom_config import PydanticModelCustomConfig
from fern_python.external_dependencies import PydanticVersionCompatibility

import fern.ir.resources as ir_types


def declared_type_name_to_named_type(declared_type_name: ir_types.DeclaredTypeName) -> ir_types.NamedType:
    return ir_types.NamedType(
        type_id=declared_type_name.type_id,
        fern_filepath=declared_type_name.fern_filepath,
        name=declared_type_name.name,
    )


def is_recursive_type_alias(
    type_id: ir_types.TypeId, context: PydanticGeneratorContext, custom_config: PydanticModelCustomConfig
) -> bool:
    """Whether an unwrapped alias or union refers back to itself and is written as a ``TypeAliasType``.

    Only Pydantic v2 resolves a ``TypeAliasType`` lazily; under v1 the plain alias is kept as before."""
    return (
        custom_config.version == PydanticVersionCompatibility.V2
        and not custom_config.wrapped_aliases
        and context.does_type_reference_other_type(type_id, type_id)
    )


def imports_after_recursive_type_alias(
    type_id: ir_types.TypeId, context: PydanticGeneratorContext
) -> Callable[[ir_types.DeclaredTypeName], bool]:
    """The types a recursive alias imports at the bottom of its file, and names as strings: those in its
    cycle, which are not defined yet when another member of the cycle is imported first."""
    in_cycle = context.get_types_in_cycle_with(type_id)
    return lambda name: name.type_id == type_id or name.type_id in in_cycle
