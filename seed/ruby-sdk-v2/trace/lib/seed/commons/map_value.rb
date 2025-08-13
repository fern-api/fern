
module Seed
    module Types
        class MapValue < Internal::Types::Model
            field :key_value_pairs, Internal::Types::Array[Seed::commons::KeyValuePair], optional: false, nullable: false

    end
end
