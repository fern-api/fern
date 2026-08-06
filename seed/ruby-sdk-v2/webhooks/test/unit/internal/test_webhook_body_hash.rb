# frozen_string_literal: true

require "test_helper"

describe Seed::Internal::WebhookBodyHash do
  WebhookBodyHash = Seed::Internal::WebhookBodyHash

  describe ".compute_hash" do
    it "computes supported hex digests" do
      expected = {
        "sha1" => "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d",
        "sha256" => "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
        "sha384" => "59e1748777448c69de6b800d7a33bbfb9ff1b463e44354c3553bcdb9c666fa90125a3c79f90397bdf5f6a13de828684f",
        "sha512" => "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043"
      }

      expected.each do |algorithm, digest|
        assert_equal digest, WebhookBodyHash.compute_hash(payload: "hello", algorithm: algorithm, encoding: "hex")
      end
    end

    it "computes base64 digests" do
      assert_equal "LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=",
                   WebhookBodyHash.compute_hash(payload: "hello", algorithm: "sha256", encoding: "base64")
    end
  end

  describe ".get_query_parameter" do
    it "extracts and decodes the first matching value without modifying the URL" do
      url = "https://example.com/webhook?other=1&bodyHash=a%2Bb&bodyHash=second"

      assert_equal "a+b", WebhookBodyHash.get_query_parameter(url, "bodyHash")
      assert_equal "https://example.com/webhook?other=1&bodyHash=a%2Bb&bodyHash=second", url
    end

    it "returns nil when the parameter is missing or the URL is unparseable" do
      assert_nil WebhookBodyHash.get_query_parameter("https://example.com/webhook?other=1", "bodyHash")
      assert_nil WebhookBodyHash.get_query_parameter("not a valid URL", "bodyHash")
    end
  end
end
