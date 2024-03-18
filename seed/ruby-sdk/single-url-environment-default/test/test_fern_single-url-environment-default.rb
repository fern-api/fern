# frozen_string_literal: true

require_relative "test_helper"
require "fern_single-url-environment-default"

# Basic SeedSingleUrlEnvironmentDefaultClient tests
class TestSeedSingleUrlEnvironmentDefaultClient < Minitest::Test
  def test_function
    SeedSingleUrlEnvironmentDefaultClient::Client.new
  end
end
