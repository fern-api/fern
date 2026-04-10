# frozen_string_literal: true

module Seed
  module Types
    class VariableValueNine < Internal::Types::Model
      field :type, -> { Seed::Types::VariableValueNineType }, optional: false, nullable: false
    end
  end
end
