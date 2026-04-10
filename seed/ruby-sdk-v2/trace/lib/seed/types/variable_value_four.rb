# frozen_string_literal: true

module Seed
  module Types
    class VariableValueFour < Internal::Types::Model
      field :type, -> { Seed::Types::VariableValueFourType }, optional: false, nullable: false
      field :value, -> { String }, optional: true, nullable: false
    end
  end
end
