# frozen_string_literal: true

require_relative "../.."

module Seed
  module Problem
    module Types
      class VariableTypeAndName < Internal::Types::Model
        field :variable_type, -> { Seed::Commons::Types::VariableType }, optional: false, nullable: false, api_name: "variableType"

        field :name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
