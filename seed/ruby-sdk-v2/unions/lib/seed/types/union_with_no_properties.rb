# frozen_string_literal: true

module Seed
    module Types
        class UnionWithNoProperties < Internal::Types::Union

            discriminant :type

            member -> { Seed::Types::Foo }, key: "FOO"
            member -> { Object }, key: "EMPTY"
    end
end
