from ...ast_node import ReferenceResolver
from .code_writer import CodeWriter


def run_code_writer(code_writer: CodeWriter, reference_resolver: ReferenceResolver) -> str:
    if isinstance(code_writer, str):
        return code_writer
    return code_writer(reference_resolver=reference_resolver)
