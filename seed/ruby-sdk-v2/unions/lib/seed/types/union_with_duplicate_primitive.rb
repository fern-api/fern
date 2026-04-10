# frozen_string_literal: true

module Seed
  module Types
    class UnionWithDuplicatePrimitive < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::UnionWithDuplicatePrimitiveInteger1 }, key: "INTEGER1"
      member -> { Seed::Types::UnionWithDuplicatePrimitiveInteger2 }, key: "INTEGER2"
      member -> { Seed::Types::UnionWithDuplicatePrimitiveString1 }, key: "STRING1"
      member -> { Seed::Types::UnionWithDuplicatePrimitiveString2 }, key: "STRING2"
    end
  end
end
