# frozen_string_literal: true

module Commons
    module Types
        class DebugKeyValuePairs < Internal::Types::Model
            field :key, DebugVariableValue, optional: true, nullable: true
            field :value, DebugVariableValue, optional: true, nullable: true
        end
    end
end
