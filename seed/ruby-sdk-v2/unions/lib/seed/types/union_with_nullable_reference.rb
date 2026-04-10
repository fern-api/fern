# frozen_string_literal: true

module Seed
  module Types
    class UnionWithNullableReference < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::UnionWithNullableReferenceFoo }, key: "FOO"
      member -> { Seed::Types::UnionWithNullableReferenceBar }, key: "BAR"
    end
  end
end
