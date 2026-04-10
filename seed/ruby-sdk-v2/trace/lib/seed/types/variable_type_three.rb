# frozen_string_literal: true

module Seed
  module Types
    class VariableTypeThree < Internal::Types::Model
      field :type, -> { Seed::Types::VariableTypeThreeType }, optional: false, nullable: false
    end
  end
end
