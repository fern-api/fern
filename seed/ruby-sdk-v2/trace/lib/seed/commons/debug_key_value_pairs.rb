# frozen_string_literal: true

module Seed
    module Types
        class DebugKeyValuePairs < Internal::Types::Model
            field :key, Seed::Commons::DebugVariableValue, optional: false, nullable: false
            field :value, Seed::Commons::DebugVariableValue, optional: false, nullable: false

    end
end
