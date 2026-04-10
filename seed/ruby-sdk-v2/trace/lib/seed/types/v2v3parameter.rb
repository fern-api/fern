# frozen_string_literal: true

module Seed
  module Types
    class V2V3Parameter < Internal::Types::Model
      field :parameter_id, -> { String }, optional: false, nullable: false, api_name: "parameterId"
      field :name, -> { String }, optional: false, nullable: false
      field :variable_type, -> { Seed::Types::VariableType }, optional: false, nullable: false, api_name: "variableType"
    end
  end
end
