"""
Utility for detecting and resolving circular references between types.

This module implements Tarjan's algorithm to find strongly connected components (SCCs)
in the type dependency graph. Types in the same SCC are mutually recursive and should
be consolidated into a single file to avoid circular import issues.
"""

from typing import Dict, List, Set

import fern.ir.resources as ir_types
from ordered_set import OrderedSet


class CircularReferenceResolver:
    """Detects mutually recursive type groups using Tarjan's algorithm."""

    def __init__(self, types: Dict[ir_types.TypeId, ir_types.TypeDeclaration]):
        self._types = types
        self._index_counter = 0
        self._stack: List[ir_types.TypeId] = []
        self._indices: Dict[ir_types.TypeId, int] = {}
        self._lowlinks: Dict[ir_types.TypeId, int] = {}
        self._on_stack: Set[ir_types.TypeId] = set()
        self._sccs: List[OrderedSet[ir_types.TypeId]] = []

    def find_mutually_recursive_groups(self) -> List[OrderedSet[ir_types.TypeId]]:
        """
        Find all strongly connected components (mutually recursive type groups).
        
        Returns:
            List of type ID sets, where each set contains types that are mutually recursive.
            Only returns groups with 2 or more types (single-type self-references are handled differently).
        """
        for type_id in self._types.keys():
            if type_id not in self._indices:
                self._strongconnect(type_id)
        
        return [scc for scc in self._sccs if len(scc) >= 2]

    def _strongconnect(self, type_id: ir_types.TypeId) -> None:
        """Tarjan's algorithm for finding strongly connected components."""
        self._indices[type_id] = self._index_counter
        self._lowlinks[type_id] = self._index_counter
        self._index_counter += 1
        self._stack.append(type_id)
        self._on_stack.add(type_id)

        type_declaration = self._types[type_id]
        for referenced_type_id in type_declaration.referenced_types:
            if referenced_type_id not in self._types:
                continue
                
            if referenced_type_id not in self._indices:
                self._strongconnect(referenced_type_id)
                self._lowlinks[type_id] = min(self._lowlinks[type_id], self._lowlinks[referenced_type_id])
            elif referenced_type_id in self._on_stack:
                self._lowlinks[type_id] = min(self._lowlinks[type_id], self._indices[referenced_type_id])

        if self._lowlinks[type_id] == self._indices[type_id]:
            scc: OrderedSet[ir_types.TypeId] = OrderedSet()
            while True:
                w = self._stack.pop()
                self._on_stack.remove(w)
                scc.add(w)
                if w == type_id:
                    break
            self._sccs.append(scc)

    def get_consolidated_filename(self, scc: OrderedSet[ir_types.TypeId]) -> str:
        """
        Generate a filename for a consolidated file containing mutually recursive types.
        
        Args:
            scc: Set of mutually recursive type IDs
            
        Returns:
            Filename without extension (e.g., "container_value_field_value_all")
        """
        type_names = []
        for type_id in sorted(scc):
            type_declaration = self._types[type_id]
            type_names.append(type_declaration.name.name.snake_case.safe_name)
        
        type_names.sort()
        
        if len(type_names) <= 3:
            return "_".join(type_names) + "_all"
        else:
            return "_".join(type_names[:2]) + "_and_others_all"
