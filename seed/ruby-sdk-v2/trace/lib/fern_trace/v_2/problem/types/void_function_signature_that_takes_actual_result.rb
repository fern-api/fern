# frozen_string_literal: true

module FernTrace
  module V2
    module Problem
      module Types
        class VoidFunctionSignatureThatTakesActualResult < Internal::Types::Model
          field :parameters, -> { Internal::Types::Array[FernTrace::V2::Problem::Types::Parameter] }, optional: false, nullable: false
          field :actual_result_type, -> { FernTrace::Commons::Types::VariableType }, optional: false, nullable: false, api_name: "actualResultType"
        end
      end
    end
  end
end
