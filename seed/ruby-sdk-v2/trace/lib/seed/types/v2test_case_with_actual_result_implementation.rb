# frozen_string_literal: true

module Seed
  module Types
    class V2TestCaseWithActualResultImplementation < Internal::Types::Model
      field :get_actual_result, -> { Seed::Types::V2NonVoidFunctionDefinition }, optional: false, nullable: false, api_name: "getActualResult"
      field :assert_correctness_check, -> { Seed::Types::V2AssertCorrectnessCheck }, optional: false, nullable: false, api_name: "assertCorrectnessCheck"
    end
  end
end
