
module Seed
    module Types
        class VoidFunctionDefinition < Internal::Types::Model
            field :parameters, , optional: false, nullable: false
            field :code, , optional: false, nullable: false
        end
    end
end
