
module Seed
    module Types
        class NonVoidFunctionSignature < Internal::Types::Model
            field :parameters, , optional: false, nullable: false
            field :return_type, , optional: false, nullable: false
        end
    end
end
