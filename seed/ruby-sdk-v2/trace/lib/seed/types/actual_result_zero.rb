# frozen_string_literal: true

module Seed
  module Types
    class ActualResultZero < Internal::Types::Model
      field :type, -> { Seed::Types::ActualResultZeroType }, optional: false, nullable: false
      field :value, -> { Seed::Types::VariableValue }, optional: true, nullable: false
    end
  end
end
