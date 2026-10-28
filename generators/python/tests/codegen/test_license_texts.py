from datetime import date

from fern.generator_exec import LicenseId

from fern_python.codegen.license_detector import detect_spdx_license
from fern_python.codegen.license_texts import SPDX_IDS, get_license_text


def test_mit_text_includes_holder_and_year() -> None:
    text = get_license_text(LicenseId.MIT, "Example Corp")
    assert text is not None
    assert f"Copyright (c) {date.today().year} Example Corp" in text
    assert detect_spdx_license(text) == "MIT"


def test_apache_text_is_recognized() -> None:
    text = get_license_text(LicenseId.APACHE_2, None)
    assert text is not None
    assert detect_spdx_license(text) == "Apache-2.0"


def test_every_spdx_id_has_text() -> None:
    for license_id in SPDX_IDS:
        assert get_license_text(license_id, None) is not None
