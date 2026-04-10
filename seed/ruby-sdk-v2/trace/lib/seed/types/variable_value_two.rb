# frozen_string_literal: true

module Seed
  module Types
    class VariableValueTwo < Internal::Types::Model
      field :type, -> { Seed::Types::VariableValueTwoType }, optional: false, nullable: false
      field :value, -> { Integer }, optional: true, nullable: false
    end
  end
end
