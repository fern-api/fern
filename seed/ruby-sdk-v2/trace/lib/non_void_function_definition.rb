# frozen_string_literal: true

module V2
    module Types
        class NonVoidFunctionDefinition < Internal::Types::Model
            field :signature, NonVoidFunctionSignature, optional: true, nullable: true
            field :code, FunctionImplementationForMultipleLanguages, optional: true, nullable: true
        end
    end
end
