# frozen_string_literal: true

module FernTrace
  module Commons
    module Types
      class MapType < Internal::Types::Model
        field :key_type, -> { FernTrace::Commons::Types::VariableType }, optional: false, nullable: false, api_name: "keyType"
        field :value_type, -> { FernTrace::Commons::Types::VariableType }, optional: false, nullable: false, api_name: "valueType"
      end
    end
  end
end
