# frozen_string_literal: true

module Seed
    module Types
        class UnionWithOptionalTime < Internal::Types::Union

            discriminant :type

            member -> { String }, key: "DATE"
            member -> { String }, key: "DATETIME"
    end
end
