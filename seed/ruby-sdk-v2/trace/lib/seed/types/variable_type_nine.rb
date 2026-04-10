# frozen_string_literal: true

module Seed
  module Types
    class VariableTypeNine < Internal::Types::Model
      field :type, -> { Seed::Types::VariableTypeNineType }, optional: false, nullable: false
    end
  end
end
