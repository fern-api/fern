
module Seed
    module Types
        class KeyValuePair < Internal::Types::Model
            field :key, Seed::commons::VariableValue, optional: false, nullable: false
            field :value, Seed::commons::VariableValue, optional: false, nullable: false
        end
    end
end
