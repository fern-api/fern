# frozen_string_literal: true

require_relative "test_helper"
require "fern_idempotency-headers"

# Basic SeedIdempotencyHeadersClient tests
class TestSeedIdempotencyHeadersClient < Minitest::Test
  def test_function
    SeedIdempotencyHeadersClient::Client.new
  end
end
