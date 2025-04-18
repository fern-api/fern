from typing import Optional, Tuple, cast
import pytest
from io import BytesIO

from core_utilities.shared.file import FileContent, with_content_type


def test_file_content_bytes() -> None:
    result = with_content_type(file=b"file content", default_content_type="text/plain")
    assert result == (None, b"file content", "text/plain")


def test_file_content_str() -> None:
    result = with_content_type(file="file content", default_content_type="text/plain")
    assert result == (None, "file content", "text/plain")


def test_file_content_io() -> None:
    file_like = BytesIO(b"file content")
    result = with_content_type(file=file_like, default_content_type="text/plain")
    filename, content, contentType = cast(Tuple[Optional[str], FileContent, Optional[str]], result)
    assert filename is None
    assert content == file_like
    assert contentType == "text/plain"


def test_tuple_2() -> None:
    result = with_content_type(file=("example.txt", b"file content"), default_content_type="text/plain")
    assert result == ("example.txt", b"file content", "text/plain")


def test_tuple_3() -> None:
    result = with_content_type(
        file=("example.txt", b"file content", "application/octet-stream"), default_content_type="text/plain"
    )
    assert result == ("example.txt", b"file content", "application/octet-stream")


def test_tuple_4() -> None:
    result = with_content_type(
        file=("example.txt", b"file content", "application/octet-stream", {"X-Custom": "value"}),
        default_content_type="text/plain",
    )
    assert result == ("example.txt", b"file content", "application/octet-stream", {"X-Custom": "value"})


def test_none_filename() -> None:
    result = with_content_type(file=(None, b"file content"), default_content_type="text/plain")
    assert result == (None, b"file content", "text/plain")


def test_invalid_tuple_length() -> None:
    with pytest.raises(ValueError):
        with_content_type(
            file=("example.txt", b"file content", "text/plain", {}, "extra"),  # type: ignore
            default_content_type="application/json",
        )
