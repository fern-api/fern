# frozen_string_literal: true

module Problem
    module Types
        class VariableTypeAndName < Internal::Types::Model
            field :variable_type, VariableType, optional: true, nullable: true
            field :name, String, optional: true, nullable: true
        end
    end
end
