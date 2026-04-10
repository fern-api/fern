# frozen_string_literal: true

module Seed
  module Types
    class VariableValueOne < Internal::Types::Model
      field :type, -> { Seed::Types::VariableValueOneType }, optional: false, nullable: false
      field :value, -> { Internal::Types::Boolean }, optional: true, nullable: false
    end
  end
end
