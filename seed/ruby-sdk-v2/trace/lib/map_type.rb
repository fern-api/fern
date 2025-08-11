# frozen_string_literal: true

module Commons
    module Types
        class MapType < Internal::Types::Model
            field :key_type, VariableType, optional: true, nullable: true
            field :value_type, VariableType, optional: true, nullable: true
        end
    end
end
