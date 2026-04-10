# frozen_string_literal: true

module Seed
  module Types
    class VariableTypeZero < Internal::Types::Model
      field :type, -> { Seed::Types::VariableTypeZeroType }, optional: false, nullable: false
    end
  end
end
