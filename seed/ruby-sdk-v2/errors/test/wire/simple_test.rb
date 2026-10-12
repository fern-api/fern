# frozen_string_literal: true

require_relative "wiremock_test_case"

class SimpleWireTest < WireMockTestCase
  def setup
    super

    @client = Seed::Client.new(base_url: WIREMOCK_BASE_URL, max_retries: 0)
  end

  def test_simple_foo_without_endpoint_error_with_wiremock
    test_id = "simple.foo_without_endpoint_error.0"

    @client.simple.foo_without_endpoint_error(
      bar: "bar",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "simple.foo_without_endpoint_error.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/foo1",
      query_params: nil,
      expected: 1
    )
  end

  def test_simple_foo_without_endpoint_error_throws_not_found_error_with_wiremock
    test_id = "simple.foo_without_endpoint_error.1"

    error = assert_raises(Seed::Errors::NotFoundError) do
      @client.simple.foo_without_endpoint_error(
        bar: "bar",
        request_options: {
          additional_headers: {
            "X-Test-Id" => "simple.foo_without_endpoint_error.1"
          }
        }
      )
    end

    assert_equal 404, error.code
    assert_equal JSON.parse('{"message":"message","code":1}'), JSON.parse(error.message)

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/foo1",
      query_params: nil,
      expected: 1
    )
  end

  def test_simple_foo_without_endpoint_error_throws_bad_request_error_with_wiremock
    test_id = "simple.foo_without_endpoint_error.2"

    error = assert_raises(Seed::Errors::ClientError) do
      @client.simple.foo_without_endpoint_error(
        bar: "bar",
        request_options: {
          additional_headers: {
            "X-Test-Id" => "simple.foo_without_endpoint_error.2"
          }
        }
      )
    end

    assert_equal 400, error.code
    assert_equal JSON.parse('{"message":"message","code":1}'), JSON.parse(error.message)

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/foo1",
      query_params: nil,
      expected: 1
    )
  end

  def test_simple_foo_without_endpoint_error_throws_internal_server_error_with_wiremock
    test_id = "simple.foo_without_endpoint_error.3"

    error = assert_raises(Seed::Errors::ServerError) do
      @client.simple.foo_without_endpoint_error(
        bar: "bar",
        request_options: {
          additional_headers: {
            "X-Test-Id" => "simple.foo_without_endpoint_error.3"
          }
        }
      )
    end

    assert_equal 500, error.code
    assert_equal JSON.parse('{"message":"message","code":1}'), JSON.parse(error.message)

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/foo1",
      query_params: nil,
      expected: 1
    )
  end

  def test_simple_foo_with_wiremock
    test_id = "simple.foo.0"

    @client.simple.foo(
      bar: "bar",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "simple.foo.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/foo2",
      query_params: nil,
      expected: 1
    )
  end

  def test_simple_foo_throws_foo_too_much_with_wiremock
    test_id = "simple.foo.1"

    error = assert_raises(Seed::Errors::ClientError) do
      @client.simple.foo(
        bar: "bar",
        request_options: {
          additional_headers: {
            "X-Test-Id" => "simple.foo.1"
          }
        }
      )
    end

    assert_equal 429, error.code
    assert_equal JSON.parse('{"message":"message","code":1}'), JSON.parse(error.message)

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/foo2",
      query_params: nil,
      expected: 1
    )
  end

  def test_simple_foo_throws_foo_too_little_with_wiremock
    test_id = "simple.foo.2"

    error = assert_raises(Seed::Errors::ServerError) do
      @client.simple.foo(
        bar: "bar",
        request_options: {
          additional_headers: {
            "X-Test-Id" => "simple.foo.2"
          }
        }
      )
    end

    assert_equal 500, error.code
    assert_equal JSON.parse('{"message":"message","code":1}'), JSON.parse(error.message)

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/foo2",
      query_params: nil,
      expected: 1
    )
  end

  def test_simple_foo_throws_not_found_error_with_wiremock
    test_id = "simple.foo.3"

    error = assert_raises(Seed::Errors::NotFoundError) do
      @client.simple.foo(
        bar: "bar",
        request_options: {
          additional_headers: {
            "X-Test-Id" => "simple.foo.3"
          }
        }
      )
    end

    assert_equal 404, error.code
    assert_equal JSON.parse('{"message":"message","code":1}'), JSON.parse(error.message)

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/foo2",
      query_params: nil,
      expected: 1
    )
  end

  def test_simple_foo_throws_bad_request_error_with_wiremock
    test_id = "simple.foo.4"

    error = assert_raises(Seed::Errors::ClientError) do
      @client.simple.foo(
        bar: "bar",
        request_options: {
          additional_headers: {
            "X-Test-Id" => "simple.foo.4"
          }
        }
      )
    end

    assert_equal 400, error.code
    assert_equal JSON.parse('{"message":"message","code":1}'), JSON.parse(error.message)

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/foo2",
      query_params: nil,
      expected: 1
    )
  end

  def test_simple_foo_throws_internal_server_error_with_wiremock
    test_id = "simple.foo.5"

    error = assert_raises(Seed::Errors::ServerError) do
      @client.simple.foo(
        bar: "bar",
        request_options: {
          additional_headers: {
            "X-Test-Id" => "simple.foo.5"
          }
        }
      )
    end

    assert_equal 500, error.code
    assert_equal JSON.parse('{"message":"message","code":1}'), JSON.parse(error.message)

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/foo2",
      query_params: nil,
      expected: 1
    )
  end

  def test_simple_foo_with_examples_with_wiremock
    test_id = "simple.foo_with_examples.0"

    @client.simple.foo_with_examples(
      bar: "hello",
      request_options: {
        additional_headers: {
          "X-Test-Id" => "simple.foo_with_examples.0"
        }
      }
    )

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/foo3",
      query_params: nil,
      expected: 1
    )
  end

  def test_simple_foo_with_examples_throws_foo_too_much_with_wiremock
    test_id = "simple.foo_with_examples.1"

    error = assert_raises(Seed::Errors::ClientError) do
      @client.simple.foo_with_examples(
        bar: "hello",
        request_options: {
          additional_headers: {
            "X-Test-Id" => "simple.foo_with_examples.1"
          }
        }
      )
    end

    assert_equal 429, error.code
    assert_equal JSON.parse('{"message":"Too much foo","code":1}'), JSON.parse(error.message)

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/foo3",
      query_params: nil,
      expected: 1
    )
  end

  def test_simple_foo_with_examples_throws_foo_too_little_with_wiremock
    test_id = "simple.foo_with_examples.2"

    error = assert_raises(Seed::Errors::ServerError) do
      @client.simple.foo_with_examples(
        bar: "hello",
        request_options: {
          additional_headers: {
            "X-Test-Id" => "simple.foo_with_examples.2"
          }
        }
      )
    end

    assert_equal 500, error.code
    assert_equal JSON.parse('{"message":"Too little foo","code":2}'), JSON.parse(error.message)

    verify_request_count(
      test_id: test_id,
      method: "POST",
      url_path: "/foo3",
      query_params: nil,
      expected: 1
    )
  end
end
