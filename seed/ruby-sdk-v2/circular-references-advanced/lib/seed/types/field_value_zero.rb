# frozen_string_literal: true

module Seed
  module Types
    class FieldValueZero < Internal::Types::Model
      field :type, -> { Seed::Types::FieldValueZeroType }, optional: false, nullable: false
      field :value, -> { Seed::Types::PrimitiveValue }, optional: true, nullable: false
    end
  end
end
