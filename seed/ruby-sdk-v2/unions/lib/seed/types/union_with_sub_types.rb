# frozen_string_literal: true

module Seed
    module Types
        class UnionWithSubTypes < Internal::Types::Union

            discriminant :type

            member -> { Seed::Types::Foo }, key: "FOO"
            member -> { Seed::Types::FooExtended }, key: "FOO_EXTENDED"
    end
end
