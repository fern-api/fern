# frozen_string_literal: true

module Seed
    module Types
        class UnionWithPrimitive < Internal::Types::Union

            discriminant :type

            member -> { Integer }, key: "INTEGER"
            member -> { String }, key: "STRING"
    end
end
