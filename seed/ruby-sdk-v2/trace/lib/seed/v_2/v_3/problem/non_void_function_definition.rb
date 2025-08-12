
module Seed
    module Types
        class NonVoidFunctionDefinition < Internal::Types::Model
            field :signature, , optional: false, nullable: false
            field :code, , optional: false, nullable: false
        end
    end
end
