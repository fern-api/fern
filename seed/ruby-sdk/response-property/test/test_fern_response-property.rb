# frozen_string_literal: true

require_relative "test_helper"
require "fern_response-property"

# Basic SeedResponsePropertyClient tests
class TestSeedResponsePropertyClient < Minitest::Test
  def test_function
    SeedResponsePropertyClient::Client.new
  end
end
