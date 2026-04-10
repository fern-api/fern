# frozen_string_literal: true

module Seed
  module Types
    class UnionWithOptionalReference < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::UnionWithOptionalReferenceFoo }, key: "FOO"
      member -> { Seed::Types::UnionWithOptionalReferenceBar }, key: "BAR"
    end
  end
end
