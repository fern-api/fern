from typing import TypedDict

from fern_python.logger import Logger

from .file import File


class DeclarationHandlerArgs(TypedDict):
    file: File
    logger: Logger
