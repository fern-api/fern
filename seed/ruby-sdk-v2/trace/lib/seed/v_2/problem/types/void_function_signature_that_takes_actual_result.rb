# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class VoidFunctionSignatureThatTakesActualResult < Internal::Types::Model
          field :parameters, lambda {
            Internal::Types::Array[Seed::V2::Problem::Types::Parameter]
          }, optional: false, nullable: false
          field :actual_result_type, lambda {
            Seed::Commons::Types::VariableType
          }, optional: false, nullable: false, api_name: "actualResultType"
        end
      end
    end
  end
end
