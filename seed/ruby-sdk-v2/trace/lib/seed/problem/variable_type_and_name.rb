
module Seed
    module Types
        class VariableTypeAndName < Internal::Types::Model
            field :variable_type, , optional: false, nullable: false
            field :name, , optional: false, nullable: false
        end
    end
end
