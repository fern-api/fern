# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          class Parameter < Internal::Types::Model
            field :parameter_id, -> { String }, optional: false, nullable: false
            field :name, -> { String }, optional: false, nullable: false
            field :variable_type, -> { Seed::Commons::Types::VariableType }, optional: false, nullable: false
          end
        end
      end
    end
  end
end
