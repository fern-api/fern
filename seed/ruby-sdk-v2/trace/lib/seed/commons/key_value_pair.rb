# frozen_string_literal: true

module Seed
    module Types
        class KeyValuePair < Internal::Types::Model
            field :key, Seed::Commons::VariableValue, optional: false, nullable: false
            field :value, Seed::Commons::VariableValue, optional: false, nullable: false

    end
end
