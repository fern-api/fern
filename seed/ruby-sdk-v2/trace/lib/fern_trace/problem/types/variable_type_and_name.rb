# frozen_string_literal: true

module FernTrace
  module Problem
    module Types
      class VariableTypeAndName < Internal::Types::Model
        field :variable_type, -> { FernTrace::Commons::Types::VariableType }, optional: false, nullable: false, api_name: "variableType"
        field :name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
