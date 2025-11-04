# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class TestCaseWithActualResultImplementation < Internal::Types::Model
          field :get_actual_result, lambda {
            Seed::V2::Problem::Types::NonVoidFunctionDefinition
          }, optional: false, nullable: false, api_name: "getActualResult"
          field :assert_correctness_check, lambda {
            Seed::V2::Problem::Types::AssertCorrectnessCheck
          }, optional: false, nullable: false, api_name: "assertCorrectnessCheck"
        end
      end
    end
  end
end
