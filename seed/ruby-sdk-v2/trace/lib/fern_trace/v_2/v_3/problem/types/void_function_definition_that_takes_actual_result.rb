# frozen_string_literal: true

module FernTrace
  module V2
    module V3
      module Problem
        module Types
          # The generated signature will include an additional param, actualResult
          class VoidFunctionDefinitionThatTakesActualResult < Internal::Types::Model
            field :additional_parameters, -> { Internal::Types::Array[FernTrace::V2::V3::Problem::Types::Parameter] }, optional: false, nullable: false, api_name: "additionalParameters"
            field :code, -> { FernTrace::V2::V3::Problem::Types::FunctionImplementationForMultipleLanguages }, optional: false, nullable: false
          end
        end
      end
    end
  end
end
