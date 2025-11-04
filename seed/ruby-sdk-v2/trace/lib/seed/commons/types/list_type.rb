# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class ListType < Internal::Types::Model
        field :value_type, lambda {
          Seed::Commons::Types::VariableType
        }, optional: false, nullable: false, api_name: "valueType"
        field :is_fixed_length, lambda {
          Internal::Types::Boolean
        }, optional: true, nullable: false, api_name: "isFixedLength"
      end
    end
  end
end
