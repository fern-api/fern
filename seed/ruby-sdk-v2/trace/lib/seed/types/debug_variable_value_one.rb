# frozen_string_literal: true

module Seed
  module Types
    class DebugVariableValueOne < Internal::Types::Model
      field :type, -> { Seed::Types::DebugVariableValueOneType }, optional: false, nullable: false
      field :value, -> { Internal::Types::Boolean }, optional: true, nullable: false
    end
  end
end
