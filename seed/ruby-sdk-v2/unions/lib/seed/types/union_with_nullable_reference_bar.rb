# frozen_string_literal: true

module Seed
  module Types
    class UnionWithNullableReferenceBar < Internal::Types::Model
      field :value, -> { Seed::Types::Bar }, optional: true, nullable: false
    end
  end
end
