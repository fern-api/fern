from typing import Optional, Set
import fern.ir.resources as ir_types


class RecursionGuard:
    """
    Guards against infinite recursion when generating examples for types with circular references.
    Tracks visited types on the current recursion path and enforces a maximum depth limit.
    """

    def __init__(self, max_depth: int = 5):
        self._visited: Set[str] = set()
        self._depth: int = 0
        self._max_depth: int = max_depth

    def _get_type_key(self, type_name: ir_types.DeclaredTypeName) -> str:
        """Generate a unique key for a type based on its package path and name."""
        fern_filepath = ".".join(type_name.fern_filepath.package_path.parts) if type_name.fern_filepath.package_path.parts else ""
        return f"{fern_filepath}:{type_name.name.original_name}"

    def can_recurse(self, type_name: ir_types.DeclaredTypeName) -> bool:
        """
        Check if we can safely recurse into the given type.
        Returns False if the type is already on the recursion stack or if max depth is exceeded.
        """
        if self._depth >= self._max_depth:
            return False
        
        type_key = self._get_type_key(type_name)
        return type_key not in self._visited

    def enter(self, type_name: ir_types.DeclaredTypeName) -> "RecursionGuard":
        """
        Enter a new recursion level for the given type.
        Returns a new RecursionGuard with the type added to the visited set.
        """
        new_guard = RecursionGuard(max_depth=self._max_depth)
        new_guard._visited = self._visited.copy()
        new_guard._visited.add(self._get_type_key(type_name))
        new_guard._depth = self._depth + 1
        return new_guard

    def with_depth_increment(self) -> "RecursionGuard":
        """
        Increment depth without adding to visited set (for containers like lists/maps).
        """
        new_guard = RecursionGuard(max_depth=self._max_depth)
        new_guard._visited = self._visited.copy()
        new_guard._depth = self._depth + 1
        return new_guard
