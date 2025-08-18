# frozen_string_literal: true

module Seed
    module Types
        class UnionWithoutKey < Internal::Types::Union

            discriminant :type

            member -> { Seed::Types::Foo }, key: "FOO"
            member -> { Seed::Types::Bar }, key: "BAR"
    end
end
