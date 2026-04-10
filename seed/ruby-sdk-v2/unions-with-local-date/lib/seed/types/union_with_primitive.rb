# frozen_string_literal: true

module Seed
  module Types
    class UnionWithPrimitive < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::UnionWithPrimitiveInteger }, key: "INTEGER"
      member -> { Seed::Types::UnionWithPrimitiveString }, key: "STRING"
    end
  end
end
