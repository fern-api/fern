from __future__ import annotations

from typing import TYPE_CHECKING, Dict, List, Set

if TYPE_CHECKING:
    import fern.ir.resources as ir_types


class CircularDependencyDetector:
    """
    Detects mutually recursive type clusters that should be consolidated into a single file.

    This addresses the issue where deeply mutually recursive types (like AST operators)
    cause circular import errors and Pydantic recursion issues when split across files.
    """

    def __init__(self, ir: ir_types.IntermediateRepresentation):
        self._ir = ir
        self._type_clusters: Dict[ir_types.TypeId, Set[ir_types.TypeId]] = {}
        self._computed = False

    def get_type_cluster(self, type_id: ir_types.TypeId) -> Set[ir_types.TypeId]:
        """
        Returns the cluster of mutually recursive types that includes the given type_id.
        If the type is not part of a circular dependency cluster, returns a set with just the type_id.
        """
        if not self._computed:
            self._compute_clusters()
        return self._type_clusters.get(type_id, {type_id})

    def is_in_circular_cluster(self, type_id: ir_types.TypeId) -> bool:
        """Returns True if the type is part of a mutually recursive cluster with 2+ types."""
        cluster = self.get_type_cluster(type_id)
        return len(cluster) > 1

    def _compute_clusters(self) -> None:
        """
        Computes clusters of mutually recursive types using graph analysis.

        Algorithm:
        1. Build a directed graph of type references
        2. Find strongly connected components (SCCs)
        3. SCCs with 2+ nodes are circular dependency clusters
        """
        graph: Dict[ir_types.TypeId, Set[ir_types.TypeId]] = {}
        for type_id, type_decl in self._ir.types.items():
            graph[type_id] = set(type_decl.referenced_types)

        sccs = self._find_strongly_connected_components(graph)

        for scc in sccs:
            if len(scc) > 1:
                scc_set = set(scc)
                for type_id in scc:
                    self._type_clusters[type_id] = scc_set
            else:
                self._type_clusters[scc[0]] = {scc[0]}

        self._computed = True

    def _find_strongly_connected_components(
        self, graph: Dict[ir_types.TypeId, Set[ir_types.TypeId]]
    ) -> List[List[ir_types.TypeId]]:
        """
        Tarjan's algorithm for finding strongly connected components.
        Returns a list of SCCs, where each SCC is a list of type_ids.
        """
        index_counter = [0]
        stack: List[ir_types.TypeId] = []
        lowlinks: Dict[ir_types.TypeId, int] = {}
        index: Dict[ir_types.TypeId, int] = {}
        on_stack: Dict[ir_types.TypeId, bool] = {}
        sccs: List[List[ir_types.TypeId]] = []

        def strongconnect(node: ir_types.TypeId) -> None:
            index[node] = index_counter[0]
            lowlinks[node] = index_counter[0]
            index_counter[0] += 1
            stack.append(node)
            on_stack[node] = True

            successors = graph.get(node, set())
            for successor in successors:
                if successor not in index:
                    strongconnect(successor)
                    lowlinks[node] = min(lowlinks[node], lowlinks[successor])
                elif on_stack.get(successor, False):
                    lowlinks[node] = min(lowlinks[node], index[successor])

            if lowlinks[node] == index[node]:
                scc: List[ir_types.TypeId] = []
                while True:
                    successor = stack.pop()
                    on_stack[successor] = False
                    scc.append(successor)
                    if successor == node:
                        break
                sccs.append(scc)

        for node in graph.keys():
            if node not in index:
                strongconnect(node)

        return sccs

    def get_all_circular_clusters(self) -> List[Set[ir_types.TypeId]]:
        """Returns all circular dependency clusters (with 2+ types)."""
        if not self._computed:
            self._compute_clusters()

        seen_clusters: Set[frozenset[ir_types.TypeId]] = set()
        circular_clusters: List[Set[ir_types.TypeId]] = []

        for type_id, cluster in self._type_clusters.items():
            if len(cluster) > 1:
                cluster_key = frozenset(cluster)
                if cluster_key not in seen_clusters:
                    seen_clusters.add(cluster_key)
                    circular_clusters.append(cluster)

        return circular_clusters
