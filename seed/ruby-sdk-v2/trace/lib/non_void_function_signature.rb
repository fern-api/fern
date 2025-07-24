# frozen_string_literal: true

module V2
    module Types
        class NonVoidFunctionSignature < Internal::Types::Model
            field :parameters, Array, optional: true, nullable: true
            field :return_type, VariableType, optional: true, nullable: true
        end
    end
end
