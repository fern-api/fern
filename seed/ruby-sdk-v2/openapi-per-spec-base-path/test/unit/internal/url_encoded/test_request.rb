# frozen_string_literal: true

require "test_helper"

describe Seed::Internal::UrlEncoded::Request do
  def build_request(body: nil, request_options: {})
    Seed::Internal::UrlEncoded::Request.new(
      base_url: "https://example.com",
      path: "/test",
      method: "POST",
      body: body,
      request_options: request_options
    )
  end

  def decoded_body(request)
    URI.decode_www_form(request.encode_body).to_h
  end

  describe "#encode_body with additional_body_parameters" do
    it "returns the body unchanged when no additional body parameters are given" do
      assert_equal({ "name" => "plant" }, decoded_body(build_request(body: { name: "plant" })))
    end

    it "returns nil when there is no body and no additional body parameters" do
      assert_nil build_request.encode_body
    end

    it "merges additional body parameters and lets them override body fields" do
      request = build_request(
        body: { name: "plant", species: "fern" },
        request_options: { additional_body_parameters: { "species" => "moss", beta_flag: "true" } }
      )

      assert_equal({ "name" => "plant", "species" => "moss", "beta_flag" => "true" }, decoded_body(request))
    end

    it "creates a body from additional body parameters when the body is nil" do
      request = build_request(request_options: { "additional_body_parameters" => { "beta_flag" => "true" } })

      assert_equal({ "beta_flag" => "true" }, decoded_body(request))
    end
  end
end
