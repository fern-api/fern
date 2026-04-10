# frozen_string_literal: true

module Seed
  module Types
    class VariableValueSeven < Internal::Types::Model
      field :type, -> { Seed::Types::VariableValueSevenType }, optional: false, nullable: false
    end
  end
end
