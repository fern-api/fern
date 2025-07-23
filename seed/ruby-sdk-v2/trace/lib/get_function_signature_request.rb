# frozen_string_literal: true

module V2
    module Types
        class GetFunctionSignatureRequest < Internal::Types::Model
            field :function_signature, FunctionSignature, optional: true, nullable: true
        end
    end
end
