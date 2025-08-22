# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class TestCaseWithExpectedResult < Internal::Types::Model
        field :test_case, -> { Seed::Commons::Types::TestCase }, optional: false, nullable: false
        field :expected_result, -> { Seed::Commons::Types::VariableValue }, optional: false, nullable: false
      end
    end
  end
end
