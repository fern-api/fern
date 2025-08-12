# frozen_string_literal: true

module Commons
    module Types
        class KeyValuePair < Internal::Types::Model
            field :key, VariableValue, optional: true, nullable: true
            field :value, VariableValue, optional: true, nullable: true
        end
    end
end
