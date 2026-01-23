# frozen_string_literal: true

module FernTrace
  module Commons
    module Types
      class TestCaseWithExpectedResult < Internal::Types::Model
        field :test_case, -> { FernTrace::Commons::Types::TestCase }, optional: false, nullable: false, api_name: "testCase"
        field :expected_result, -> { FernTrace::Commons::Types::VariableValue }, optional: false, nullable: false, api_name: "expectedResult"
      end
    end
  end
end
