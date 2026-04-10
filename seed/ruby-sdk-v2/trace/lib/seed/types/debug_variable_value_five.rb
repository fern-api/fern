# frozen_string_literal: true

module Seed
  module Types
    class DebugVariableValueFive < Internal::Types::Model
      field :type, -> { Seed::Types::DebugVariableValueFiveType }, optional: false, nullable: false
    end
  end
end
