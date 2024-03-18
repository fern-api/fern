# frozen_string_literal: true

require_relative "test_helper"
require "fern_error-property"

# Basic SeedErrorPropertyClient tests
class TestSeedErrorPropertyClient < Minitest::Test
  def test_function
    SeedErrorPropertyClient::Client.new
  end
end
