# frozen_string_literal: true

require "test_helper"

describe <%= gem_namespace %>::Errors::ResponseError do
  it "defaults to empty headers for existing callers" do
    error = <%= gem_namespace %>::Errors::ResponseError.new("unavailable", code: 503)

    assert_empty error.headers
  end

  it "preserves response headers on status-specific errors" do
    headers = { "retry-after" => ["30"], "x-request-id" => ["req_123"], "set-cookie" => ["a=1", "b=2"] }
    body = { "message" => "unavailable" }
    error_class = <%= gem_namespace %>::Errors::ResponseError.subclass_for_code(503)
    error = error_class.new("unavailable", code: 503, body: body, headers: headers)

    assert_equal headers, error.headers
    assert_equal 503, error.code
    assert_equal body, error.body
    assert_equal "unavailable", error.message
  end
end
