# frozen_string_literal: true

module Seed
  module Types
    class V2V3TestCaseWithActualResultImplementation < Internal::Types::Model
      field :get_actual_result, -> { Seed::Types::V2V3NonVoidFunctionDefinition }, optional: false, nullable: false, api_name: "getActualResult"
      field :assert_correctness_check, -> { Seed::Types::V2V3AssertCorrectnessCheck }, optional: false, nullable: false, api_name: "assertCorrectnessCheck"
    end
  end
end
