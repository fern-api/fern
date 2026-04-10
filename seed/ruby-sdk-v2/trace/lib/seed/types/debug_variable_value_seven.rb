# frozen_string_literal: true

module Seed
  module Types
    class DebugVariableValueSeven < Internal::Types::Model
      field :type, -> { Seed::Types::DebugVariableValueSevenType }, optional: false, nullable: false
    end
  end
end
