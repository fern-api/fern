# frozen_string_literal: true

module Seed
  module Types
    class VariableTypeEight < Internal::Types::Model
      field :type, -> { Seed::Types::VariableTypeEightType }, optional: false, nullable: false
    end
  end
end
