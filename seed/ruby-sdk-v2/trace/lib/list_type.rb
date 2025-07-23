# frozen_string_literal: true

module Commons
    module Types
        class ListType < Internal::Types::Model
            field :value_type, VariableType, optional: true, nullable: true
            field :is_fixed_length, Array, optional: true, nullable: true
        end
    end
end
