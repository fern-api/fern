# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class Parameter < Internal::Types::Model
          field :parameter_id, -> { String }, optional: false, nullable: false, api_name: "parameterId"
          field :name, -> { String }, optional: false, nullable: false
          field :variable_type, lambda {
            Seed::Commons::Types::VariableType
          }, optional: false, nullable: false, api_name: "variableType"
        end
      end
    end
  end
end
