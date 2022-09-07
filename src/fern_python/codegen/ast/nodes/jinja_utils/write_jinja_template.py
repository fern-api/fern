from jinja2 import Template

from ...ast_node import ReferenceResolver, Writer


def write_jinja_template(template: Template, writer: Writer, reference_resolver: ReferenceResolver) -> None:
    content = template.render(writer=writer, reference_resolver=reference_resolver)
    writer.write(content)
