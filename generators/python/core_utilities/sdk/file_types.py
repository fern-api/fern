import typing


# File typing inspired by the flexibility of types within the httpx library
# https://github.com/encode/httpx/blob/master/httpx/_types.py
FileContent = typing.Union[typing.IO[bytes], bytes, str]
FileTypes = typing.Union[
    # file (or bytes)
    FileContent,
    # (filename, file (or bytes))
    typing.Tuple[typing.Optional[str], FileContent],
    # (filename, file (or bytes), content_type)
    typing.Tuple[typing.Optional[str], FileContent, typing.Optional[str]],
    # (filename, file (or bytes), content_type, headers)
    typing.Tuple[typing.Optional[str], FileContent, typing.Optional[str], typing.Mapping[str, str]],
]
