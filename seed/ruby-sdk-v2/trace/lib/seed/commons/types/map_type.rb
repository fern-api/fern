# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class MapType < Internal::Types::Model
        field :key_type, -> { Seed::Commons::Types::VariableType }, optional: false, nullable: false
        field :value_type, -> { Seed::Commons::Types::VariableType }, optional: false, nullable: false
      end
    end
  end
end
