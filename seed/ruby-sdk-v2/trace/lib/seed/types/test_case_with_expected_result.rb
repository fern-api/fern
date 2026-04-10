# frozen_string_literal: true

module Seed
  module Types
    class TestCaseWithExpectedResult < Internal::Types::Model
      field :test_case, -> { Seed::Types::TestCase }, optional: false, nullable: false, api_name: "testCase"
      field :expected_result, -> { Seed::Types::VariableValue }, optional: false, nullable: false, api_name: "expectedResult"
    end
  end
end
