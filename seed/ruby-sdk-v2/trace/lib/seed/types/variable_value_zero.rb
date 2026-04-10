# frozen_string_literal: true

module Seed
  module Types
    class VariableValueZero < Internal::Types::Model
      field :type, -> { Seed::Types::VariableValueZeroType }, optional: false, nullable: false
      field :value, -> { Integer }, optional: true, nullable: false
    end
  end
end
