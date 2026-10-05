# frozen_string_literal: true

require "test_helper"

describe Seed::Internal::JSON::Request do
  def build_request(body: nil, request_options: {})
    Seed::Internal::JSON::Request.new(
      base_url: "https://example.com",
      path: "/test",
      method: "POST",
      body: body,
      request_options: request_options
    )
  end

  def encoded_body(request)
    JSON.parse(request.encode_body)
  end

  describe "#encode_body with additional_body_parameters" do
    it "returns the body unchanged when no additional body parameters are given" do
      request = build_request(body: { name: "plant" })

      assert_equal({ "name" => "plant" }, encoded_body(request))
    end

    it "returns nil when there is no body and no additional body parameters" do
      assert_nil build_request.encode_body
    end

    it "merges additional body parameters into the body" do
      request = build_request(
        body: { name: "plant" },
        request_options: { additional_body_parameters: { "beta_flag" => true } }
      )

      assert_equal({ "name" => "plant", "beta_flag" => true }, encoded_body(request))
    end

    it "lets additional body parameters override body fields with the same key" do
      request = build_request(
        body: { name: "plant", "species" => "fern" },
        request_options: { additional_body_parameters: { "name" => "override", species: "moss" } }
      )

      assert_equal({ "name" => "override", "species" => "moss" }, encoded_body(request))
    end

    it "creates a body from additional body parameters when the body is nil" do
      request = build_request(request_options: { additional_body_parameters: { "beta_flag" => true } })

      assert_equal({ "beta_flag" => true }, encoded_body(request))
      assert_equal "application/json", request.encode_headers["Content-Type"]
    end

    it "supports nested values" do
      request = build_request(
        body: { name: "plant" },
        request_options: {
          additional_body_parameters: { "metadata" => { "tags" => %w[green leafy], "height" => { "cm" => 30 } } }
        }
      )

      assert_equal(
        { "name" => "plant", "metadata" => { "tags" => %w[green leafy], "height" => { "cm" => 30 } } },
        encoded_body(request)
      )
    end

    it "accepts string-keyed request options" do
      request = build_request(
        body: { name: "plant" },
        request_options: { "additional_body_parameters" => { "beta_flag" => true } }
      )

      assert_equal({ "name" => "plant", "beta_flag" => true }, encoded_body(request))
    end

    it "does not merge into array bodies" do
      request = build_request(
        body: %w[a b],
        request_options: { additional_body_parameters: { "beta_flag" => true } }
      )

      assert_equal %w[a b], encoded_body(request)
    end

    it "does not mutate the original body" do
      body = { name: "plant" }
      build_request(body: body, request_options: { additional_body_parameters: { "beta_flag" => true } }).encode_body

      assert_equal({ name: "plant" }, body)
    end
  end
end
