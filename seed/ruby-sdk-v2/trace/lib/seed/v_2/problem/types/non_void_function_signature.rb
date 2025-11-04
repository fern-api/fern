# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class NonVoidFunctionSignature < Internal::Types::Model
          field :parameters, lambda {
            Internal::Types::Array[Seed::V2::Problem::Types::Parameter]
          }, optional: false, nullable: false
          field :return_type, lambda {
            Seed::Commons::Types::VariableType
          }, optional: false, nullable: false, api_name: "returnType"
        end
      end
    end
  end
end
