# frozen_string_literal: true

require_relative "test_helper"
require "fern_auth-environment-variables"

# Basic SeedAuthEnvironmentVariablesClient tests
class TestSeedAuthEnvironmentVariablesClient < Minitest::Test
  def test_function
    SeedAuthEnvironmentVariablesClient::Client.new
  end
end
