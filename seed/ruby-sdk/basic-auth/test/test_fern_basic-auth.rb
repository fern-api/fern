# frozen_string_literal: true

require_relative "test_helper"
require "fern_basic-auth"

# Basic SeedBasicAuthClient tests
class TestSeedBasicAuthClient < Minitest::Test
  def test_function
    SeedBasicAuthClient::Client.new
  end
end
