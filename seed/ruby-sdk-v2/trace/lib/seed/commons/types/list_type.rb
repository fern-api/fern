# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class ListType < Internal::Types::Model
        field :value_type, -> { Seed::Commons::Types::VariableType }, optional: false, nullable: false
        field :is_fixed_length, -> { Internal::Types::Boolean }, optional: true, nullable: false
      end
    end
  end
end
