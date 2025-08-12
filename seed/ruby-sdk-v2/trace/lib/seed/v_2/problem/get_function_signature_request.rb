
module Seed
    module Types
        class GetFunctionSignatureRequest < Internal::Types::Model
            field :function_signature, Seed::v_2::problem::FunctionSignature, optional: false, nullable: false
        end
    end
end
