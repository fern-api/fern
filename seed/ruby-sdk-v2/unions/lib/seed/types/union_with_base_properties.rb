# frozen_string_literal: true

module Seed
    module Types
        class UnionWithBaseProperties < Internal::Types::Union

            discriminant :type

            member -> { Integer }, key: "INTEGER"
            member -> { String }, key: "STRING"
            member -> { Seed::Types::Foo }, key: "FOO"
    end
end
