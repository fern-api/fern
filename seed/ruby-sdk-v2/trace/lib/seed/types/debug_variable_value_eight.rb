# frozen_string_literal: true

module Seed
  module Types
    class DebugVariableValueEight < Internal::Types::Model
      field :type, -> { Seed::Types::DebugVariableValueEightType }, optional: false, nullable: false
    end
  end
end
