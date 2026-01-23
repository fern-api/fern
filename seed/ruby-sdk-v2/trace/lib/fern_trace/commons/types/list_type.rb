# frozen_string_literal: true

module FernTrace
  module Commons
    module Types
      class ListType < Internal::Types::Model
        field :value_type, -> { FernTrace::Commons::Types::VariableType }, optional: false, nullable: false, api_name: "valueType"
        field :is_fixed_length, -> { Internal::Types::Boolean }, optional: true, nullable: false, api_name: "isFixedLength"
      end
    end
  end
end
