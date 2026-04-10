# frozen_string_literal: true

module Seed
  module Types
    class MapType < Internal::Types::Model
      field :key_type, -> { Seed::Types::VariableType }, optional: false, nullable: false, api_name: "keyType"
      field :value_type, -> { Seed::Types::VariableType }, optional: false, nullable: false, api_name: "valueType"
    end
  end
end
