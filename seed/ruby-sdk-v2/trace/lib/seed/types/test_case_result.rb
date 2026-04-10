# frozen_string_literal: true

module Seed
  module Types
    class TestCaseResult < Internal::Types::Model
      field :expected_result, -> { Seed::Types::VariableValue }, optional: false, nullable: false, api_name: "expectedResult"
      field :actual_result, -> { Seed::Types::ActualResult }, optional: false, nullable: false, api_name: "actualResult"
      field :passed, -> { Internal::Types::Boolean }, optional: false, nullable: false
    end
  end
end
