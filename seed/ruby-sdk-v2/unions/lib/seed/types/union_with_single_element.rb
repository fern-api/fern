# frozen_string_literal: true

module Seed
    module Types
        class UnionWithSingleElement < Internal::Types::Union

            discriminant :type

            member -> { Seed::Types::Foo }, key: "FOO"
    end
end
