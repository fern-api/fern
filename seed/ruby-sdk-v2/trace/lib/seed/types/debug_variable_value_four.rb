# frozen_string_literal: true

module Seed
  module Types
    class DebugVariableValueFour < Internal::Types::Model
      field :type, -> { Seed::Types::DebugVariableValueFourType }, optional: false, nullable: false
      field :value, -> { String }, optional: true, nullable: false
    end
  end
end
