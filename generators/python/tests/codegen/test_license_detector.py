import tempfile
from pathlib import Path

import pytest

from fern_python.codegen.license_detector import detect_spdx_license, detect_spdx_license_from_file


@pytest.mark.parametrize(
    "content,expected",
    [
        ("Apache License\nVersion 2.0, January 2004", "Apache-2.0"),
        ("MIT License\n\nCopyright (c) 2026", "MIT"),
        ("BSD 3-Clause License", "BSD-3-Clause"),
        ("BSD 2-Clause License", "BSD-2-Clause"),
        ("GNU GENERAL PUBLIC LICENSE\nVersion 3, 29 June 2007", "GPL-3.0-only"),
        ("GNU GENERAL PUBLIC LICENSE\nVersion 2, June 1991", "GPL-2.0-only"),
        ("Mozilla Public License Version 2.0", "MPL-2.0"),
        ("ISC License", "ISC"),
        ("Bloomberg Custom License v1\nAll rights reserved.", None),
        ("", None),
    ],
)
def test_detect_spdx_license(content: str, expected: str | None) -> None:
    assert detect_spdx_license(content) == expected


def test_detect_from_file_uses_first_existing_path() -> None:
    with tempfile.TemporaryDirectory() as tmpdir:
        license_path = Path(tmpdir) / "LICENSE"
        license_path.write_text("MIT License")
        missing = str(Path(tmpdir) / "missing")
        assert detect_spdx_license_from_file(missing, str(license_path)) == "MIT"
        assert detect_spdx_license_from_file(missing) is None
