# frozen_string_literal: true

module FernTrace
  module V2
    module V3
      module Problem
        module Types
          class Parameter < Internal::Types::Model
            field :parameter_id, -> { String }, optional: false, nullable: false, api_name: "parameterId"
            field :name, -> { String }, optional: false, nullable: false
            field :variable_type, -> { FernTrace::Commons::Types::VariableType }, optional: false, nullable: false, api_name: "variableType"
          end
        end
      end
    end
  end
end
