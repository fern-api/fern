# frozen_string_literal: true

require_relative "test_helper"
require "fern_single-url-environment-no-default"

# Basic SeedSingleUrlEnvironmentNoDefaultClient tests
class TestSeedSingleUrlEnvironmentNoDefaultClient < Minitest::Test
  def test_function
    SeedSingleUrlEnvironmentNoDefaultClient::Client.new
  end
end
