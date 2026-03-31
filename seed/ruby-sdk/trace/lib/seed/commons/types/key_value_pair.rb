# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class KeyValuePair < Internal::Types::Model
        field :key, -> { Seed::Commons::Types::VariableValue }, optional: false, nullable: false
        field :value, -> { Seed::Commons::Types::VariableValue }, optional: false, nullable: false
      end
    end
  end
end
