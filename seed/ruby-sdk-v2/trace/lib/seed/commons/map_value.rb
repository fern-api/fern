# frozen_string_literal: true

module Seed
    module Types
        class MapValue < Internal::Types::Model
            field :key_value_pairs, Internal::Types::Array[Seed::Commons::KeyValuePair], optional: false, nullable: false

    end
end
