# frozen_string_literal: true

module Seed
  module Types
    class DebugVariableValueTwo < Internal::Types::Model
      field :type, -> { Seed::Types::DebugVariableValueTwoType }, optional: false, nullable: false
      field :value, -> { Integer }, optional: true, nullable: false
    end
  end
end
