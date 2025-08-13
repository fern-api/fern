
module Seed
    module Types
        class DebugKeyValuePairs < Internal::Types::Model
            field :key, Seed::commons::DebugVariableValue, optional: false, nullable: false
            field :value, Seed::commons::DebugVariableValue, optional: false, nullable: false

    end
end
