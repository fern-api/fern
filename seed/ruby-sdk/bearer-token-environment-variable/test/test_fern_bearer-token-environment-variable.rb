# frozen_string_literal: true

require_relative "test_helper"
require "fern_bearer-token-environment-variable"

# Basic SeedBearerTokenEnvironmentVariableClient tests
class TestSeedBearerTokenEnvironmentVariableClient < Minitest::Test
  def test_function
    SeedBearerTokenEnvironmentVariableClient::Client.new
  end
end
