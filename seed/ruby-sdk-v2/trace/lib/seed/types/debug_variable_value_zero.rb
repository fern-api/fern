# frozen_string_literal: true

module Seed
  module Types
    class DebugVariableValueZero < Internal::Types::Model
      field :type, -> { Seed::Types::DebugVariableValueZeroType }, optional: false, nullable: false
      field :value, -> { Integer }, optional: true, nullable: false
    end
  end
end
