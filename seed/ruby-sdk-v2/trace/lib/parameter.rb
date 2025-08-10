# frozen_string_literal: true

module V2
    module Types
        class Parameter < Internal::Types::Model
            field :parameter_id, ParameterId, optional: true, nullable: true
            field :name, String, optional: true, nullable: true
            field :variable_type, VariableType, optional: true, nullable: true
        end
    end
end
