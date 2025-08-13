# frozen_string_literal: true

module Seed
    module Types
        class UnionWithLiteral < Internal::Types::Union

            discriminant :type

            member -> { String }, key: "FERN"
    end
end
