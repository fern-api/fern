# frozen_string_literal: true

module FernTrace
  module V2
    module V3
      module Problem
        module Types
          class VoidFunctionDefinition < Internal::Types::Model
            field :parameters, -> { Internal::Types::Array[FernTrace::V2::V3::Problem::Types::Parameter] }, optional: false, nullable: false
            field :code, -> { FernTrace::V2::V3::Problem::Types::FunctionImplementationForMultipleLanguages }, optional: false, nullable: false
          end
        end
      end
    end
  end
end
