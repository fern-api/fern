# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          class NonVoidFunctionSignature < Internal::Types::Model
            field :parameters, lambda {
              Internal::Types::Array[Seed::V2::V3::Problem::Types::Parameter]
            }, optional: false, nullable: false
            field :return_type, -> { Seed::Commons::Types::VariableType }, optional: false, nullable: false
          end
        end
      end
    end
  end
end
