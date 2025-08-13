
module Seed
    module Types
        class DebugMapValue < Internal::Types::Model
            field :key_value_pairs, Internal::Types::Array[Seed::commons::DebugKeyValuePairs], optional: false, nullable: false
        end
    end
end
