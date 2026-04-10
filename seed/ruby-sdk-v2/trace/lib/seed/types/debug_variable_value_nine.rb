# frozen_string_literal: true

module Seed
  module Types
    class DebugVariableValueNine < Internal::Types::Model
      field :type, -> { Seed::Types::DebugVariableValueNineType }, optional: false, nullable: false
    end
  end
end
