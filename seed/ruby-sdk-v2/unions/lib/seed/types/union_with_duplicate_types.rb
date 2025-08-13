# frozen_string_literal: true

module Seed
    module Types
        class UnionWithDuplicateTypes < Internal::Types::Union

            discriminant :type

            member -> { Seed::Types::Foo }, key: "FOO_1"
            member -> { Seed::Types::Foo }, key: "FOO_2"
    end
end
