# frozen_string_literal: true

module Seed
  module Service
    module Types
      class OptionalMergePatchRequest < Internal::Types::Model
        field :required_field, -> { String }, optional: false, nullable: false
        field :optional_string, -> { String }, optional: true, nullable: false
        field :optional_integer, -> { Integer }, optional: true, nullable: false
        field :optional_boolean, -> { Internal::Types::Boolean }, optional: true, nullable: false
        field :nullable_string, -> { String }, optional: false, nullable: true
      end
    end
  end
end
