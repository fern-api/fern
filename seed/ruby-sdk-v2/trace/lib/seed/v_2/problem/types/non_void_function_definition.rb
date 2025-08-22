# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class NonVoidFunctionDefinition < Internal::Types::Model
          field :signature, -> { Seed::V2::Problem::Types::NonVoidFunctionSignature }, optional: false, nullable: false
          field :code, lambda {
            Seed::V2::Problem::Types::FunctionImplementationForMultipleLanguages
          }, optional: false, nullable: false
        end
      end
    end
  end
end
