# frozen_string_literal: true

require_relative "test_helper"
require "fern_query-parameters"

# Basic SeedQueryParametersClient tests
class TestSeedQueryParametersClient < Minitest::Test
  def test_function
    SeedQueryParametersClient::Client.new
  end
end
