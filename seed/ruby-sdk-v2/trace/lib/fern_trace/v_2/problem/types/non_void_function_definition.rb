# frozen_string_literal: true

module FernTrace
  module V2
    module Problem
      module Types
        class NonVoidFunctionDefinition < Internal::Types::Model
          field :signature, -> { FernTrace::V2::Problem::Types::NonVoidFunctionSignature }, optional: false, nullable: false
          field :code, -> { FernTrace::V2::Problem::Types::FunctionImplementationForMultipleLanguages }, optional: false, nullable: false
        end
      end
    end
  end
end
