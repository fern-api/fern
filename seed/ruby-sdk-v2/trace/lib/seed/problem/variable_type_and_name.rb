
module Seed
    module Types
        class VariableTypeAndName < Internal::Types::Model
            field :variable_type, Seed::commons::VariableType, optional: false, nullable: false
            field :name, String, optional: false, nullable: false

    end
end
