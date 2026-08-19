from __future__ import annotations

from typing import Optional, Sequence, Union

from ...ast_node import AstNode, AstNodeMetadata, NodeWriter
from ..expressions.expression import Expression


class ExceptHandler(AstNode):
    """
    Represents an except handler in a try statement.

    Examples:
    ```python
    except ValueError:
        # handle ValueError

    except (KeyError, IndexError) as e:
        # handle multiple exceptions

    except:
        # catch all exceptions
    ```
    """

    def __init__(
        self,
        body: Sequence[AstNode],
        exception_type: Optional[Union[Expression, AstNode, str]] = None,
        name: Optional[str] = None,
    ):
        self.body = list(body)
        self.exception_type = (
            exception_type
            if exception_type is None or isinstance(exception_type, Expression)
            else Expression(exception_type)
        )
        self.name = name

    def get_metadata(self) -> AstNodeMetadata:
        metadata = AstNodeMetadata()

        if self.exception_type is not None:
            metadata.update(self.exception_type.get_metadata())
        for statement in self.body:
            metadata.update(statement.get_metadata())

        return metadata

    def write(self, writer: NodeWriter, should_write_as_snippet: Optional[bool] = None) -> None:
        writer.write("except")

        if self.exception_type is not None:
            writer.write(" ")
            writer.write_node(self.exception_type)

            if self.name is not None:
                writer.write(f" as {self.name}")

        writer.write(":")
        writer.write_line()

        with writer.indent():
            if self.body:
                for statement in self.body:
                    writer.write_node(statement)
                    writer.write_newline_if_last_line_not()
            else:
                writer.write_line("pass")
