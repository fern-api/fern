# frozen_string_literal: true

module FernTrace
  module Commons
    module Types
      class DebugKeyValuePairs < Internal::Types::Model
        field :key, -> { FernTrace::Commons::Types::DebugVariableValue }, optional: false, nullable: false
        field :value, -> { FernTrace::Commons::Types::DebugVariableValue }, optional: false, nullable: false
      end
    end
  end
end
