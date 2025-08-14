# frozen_string_literal: true

module Seed
    module Types
        class Parameter < Internal::Types::Model
            field :parameter_id, String, optional: false, nullable: false
            field :name, String, optional: false, nullable: false
            field :variable_type, Seed::Commons::VariableType, optional: false, nullable: false

    end
end
