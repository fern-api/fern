# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class TestCaseWithExpectedResult < Internal::Types::Model
        field :test_case, -> { Seed::Commons::Types::TestCase }, optional: false, nullable: false, api_name: "testCase"
        field :expected_result, lambda {
          Seed::Commons::Types::VariableValue
        }, optional: false, nullable: false, api_name: "expectedResult"
      end
    end
  end
end
