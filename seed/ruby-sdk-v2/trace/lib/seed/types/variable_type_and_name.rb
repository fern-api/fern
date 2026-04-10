# frozen_string_literal: true

module Seed
  module Types
    class VariableTypeAndName < Internal::Types::Model
      field :variable_type, -> { Seed::Types::VariableType }, optional: false, nullable: false, api_name: "variableType"
      field :name, -> { String }, optional: false, nullable: false
    end
  end
end
