# frozen_string_literal: true

module Seed
    module Types
        class NonVoidFunctionDefinition < Internal::Types::Model
            field :signature, Seed::V2::Problem::NonVoidFunctionSignature, optional: false, nullable: false
            field :code, Seed::V2::Problem::FunctionImplementationForMultipleLanguages, optional: false, nullable: false

    end
end
