from pathlib import Path


def test_v1_on_v2_parse_obj_as_uses_v1_base_model_check() -> None:
    """
    Regression test (source-level):

    The v1-on-v2 core utility templates are *copied* into the generated SDK's core package.
    They are not importable directly from their template location.

    We still want to ensure the template is hardened to detect v1-on-v2 models correctly:
    it must not check `issubclass(..., pydantic.BaseModel)` (v2 hierarchy), and instead must
    check against a resolved v1 BaseModel (`pydantic.v1.BaseModel`).
    """

    template_path = (
        Path(__file__).resolve().parents[2]
        / "core_utilities"
        / "shared"
        / "with_pydantic_v1_on_v2"
        / "pydantic_utilities.py"
    )
    contents = template_path.read_text(encoding="utf-8")

    assert "_PYDANTIC_V1_BASE_MODEL" in contents
    assert "issubclass(type_, _PYDANTIC_V1_BASE_MODEL)" in contents
    assert "issubclass(type_, pydantic.BaseModel)" not in contents
