from typing import Set

from jinja2 import Template

from ...ast_node import ReferenceResolver
from ...reference import Reference
from .noop_writer import NoopWriter


class JinjaTemplateReferenceLoader(ReferenceResolver):
    _references: Set[Reference] = set()

    def resolve_reference(self, reference: Reference) -> str:
        self._references.add(reference)
        return "<UNRESOLVED REFERENCE>"

    def get_references(self) -> Set[Reference]:
        return self._references


def get_references_from_jinja_template(template: Template) -> Set[Reference]:
    jinja_reference_loader = JinjaTemplateReferenceLoader()
    template.render(writer=NoopWriter(), reference_resolver=jinja_reference_loader)
    return jinja_reference_loader.get_references()
