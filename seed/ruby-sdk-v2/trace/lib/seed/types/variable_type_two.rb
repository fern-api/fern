# frozen_string_literal: true

module Seed
  module Types
    class VariableTypeTwo < Internal::Types::Model
      field :type, -> { Seed::Types::VariableTypeTwoType }, optional: false, nullable: false
    end
  end
end
