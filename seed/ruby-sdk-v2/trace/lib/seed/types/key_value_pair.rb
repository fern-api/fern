# frozen_string_literal: true

module Seed
  module Types
    class KeyValuePair < Internal::Types::Model
      field :key, -> { Seed::Types::VariableValue }, optional: false, nullable: false
      field :value, -> { Seed::Types::VariableValue }, optional: false, nullable: false
    end
  end
end
