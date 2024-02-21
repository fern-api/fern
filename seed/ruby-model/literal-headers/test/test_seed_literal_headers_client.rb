# frozen_string_literal: true

require_relative "test_helper"
require "seed_literal_headers_client"

# Basic SeedLiteralHeadersClient tests
class TestSeedLiteralHeadersClient < Minitest::Test
  def test_function
    SeedLiteralHeadersClient::Client.new
  end
end
