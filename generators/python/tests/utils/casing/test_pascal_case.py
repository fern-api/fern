from fern_python.utils import pascal_case


def test_pascal_case() -> None:
    assert pascal_case("hello world") == "HelloWorld"
    assert pascal_case("hello_world") == "HelloWorld"
    assert pascal_case("helloWorld") == "HelloWorld"
    assert pascal_case("HELLO_WORLD") == "HelloWorld"
    assert pascal_case("hello-world") == "HelloWorld"
