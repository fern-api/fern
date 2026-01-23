# frozen_string_literal: true

module FernNullableAllofExtends
  module Types
    # This schema has nullable:true at the top level.
    class NullableObject < Internal::Types::Model
      field :nullable_field, -> { String }, optional: true, nullable: false, api_name: "nullableField"
    end
  end
end
