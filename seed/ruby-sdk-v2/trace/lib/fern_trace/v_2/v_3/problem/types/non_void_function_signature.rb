# frozen_string_literal: true

module FernTrace
  module V2
    module V3
      module Problem
        module Types
          class NonVoidFunctionSignature < Internal::Types::Model
            field :parameters, -> { Internal::Types::Array[FernTrace::V2::V3::Problem::Types::Parameter] }, optional: false, nullable: false
            field :return_type, -> { FernTrace::Commons::Types::VariableType }, optional: false, nullable: false, api_name: "returnType"
          end
        end
      end
    end
  end
end
