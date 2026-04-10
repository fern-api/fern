# frozen_string_literal: true

module Seed
  module Types
    class VariableTypeFour < Internal::Types::Model
      field :type, -> { Seed::Types::VariableTypeFourType }, optional: false, nullable: false
    end
  end
end
