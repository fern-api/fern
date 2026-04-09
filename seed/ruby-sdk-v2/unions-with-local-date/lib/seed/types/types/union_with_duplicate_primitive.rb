# frozen_string_literal: true

module Seed
  module Types
    module Types
      class UnionWithDuplicatePrimitive < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Integer }, key: "INTEGER1"
        member -> { Integer }, key: "INTEGER2"
        member -> { String }, key: "STRING1"
        member -> { String }, key: "STRING2"
      end
    end
  end
end
