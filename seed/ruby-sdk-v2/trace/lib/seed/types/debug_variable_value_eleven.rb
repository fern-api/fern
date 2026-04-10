# frozen_string_literal: true

module Seed
  module Types
    class DebugVariableValueEleven < Internal::Types::Model
      field :type, -> { Seed::Types::DebugVariableValueElevenType }, optional: false, nullable: false
    end
  end
end
