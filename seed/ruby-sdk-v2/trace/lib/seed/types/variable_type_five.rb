# frozen_string_literal: true

module Seed
  module Types
    class VariableTypeFive < Internal::Types::Model
      field :type, -> { Seed::Types::VariableTypeFiveType }, optional: false, nullable: false
    end
  end
end
