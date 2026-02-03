# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithDuplicatePrimitive < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Integer }, key: "INTEGER_1"
        member -> { Integer }, key: "INTEGER_2"
        member -> { String }, key: "STRING_1"
        member -> { String }, key: "STRING_2"
      end
    end
  end
end
