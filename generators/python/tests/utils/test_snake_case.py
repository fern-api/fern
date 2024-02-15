from fern_python.utils import snake_case


def test_snake_case() -> None:
    assert snake_case("hello world") == "hello_world"
    assert snake_case("hello_world") == "hello_world"
    assert snake_case("helloWorld") == "hello_world"
    assert snake_case("HELLO_WORLD") == "hello_world"
    assert snake_case("hello-world") == "hello_world"
