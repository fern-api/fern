# frozen_string_literal: true

module Commons
    module Types
        class MapValue < Internal::Types::Model
            field :key_value_pairs, Array, optional: true, nullable: true
        end
    end
end
