# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        # The generated signature will include an additional param, actualResult
        class VoidFunctionDefinitionThatTakesActualResult < Internal::Types::Model
          field :additional_parameters, lambda {
            Internal::Types::Array[Seed::V2::Problem::Types::Parameter]
          }, optional: false, nullable: false
          field :code, lambda {
            Seed::V2::Problem::Types::FunctionImplementationForMultipleLanguages
          }, optional: false, nullable: false
        end
      end
    end
  end
end
