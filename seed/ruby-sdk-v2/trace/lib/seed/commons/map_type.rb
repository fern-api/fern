# frozen_string_literal: true

module Seed
    module Types
        class MapType < Internal::Types::Model
            field :key_type, Seed::Commons::VariableType, optional: false, nullable: false
            field :value_type, Seed::Commons::VariableType, optional: false, nullable: false

    end
end
