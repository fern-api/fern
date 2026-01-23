# frozen_string_literal: true

module FernTrace
  module Commons
    module Types
      class KeyValuePair < Internal::Types::Model
        field :key, -> { FernTrace::Commons::Types::VariableValue }, optional: false, nullable: false
        field :value, -> { FernTrace::Commons::Types::VariableValue }, optional: false, nullable: false
      end
    end
  end
end
