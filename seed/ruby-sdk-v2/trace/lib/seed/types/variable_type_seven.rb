# frozen_string_literal: true

module Seed
  module Types
    class VariableTypeSeven < Internal::Types::Model
      field :type, -> { Seed::Types::VariableTypeSevenType }, optional: false, nullable: false
    end
  end
end
