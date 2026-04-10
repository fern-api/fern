# frozen_string_literal: true

module Seed
  module Types
    class VariableTypeOne < Internal::Types::Model
      field :type, -> { Seed::Types::VariableTypeOneType }, optional: false, nullable: false
    end
  end
end
