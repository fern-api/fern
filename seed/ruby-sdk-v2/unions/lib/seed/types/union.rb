# frozen_string_literal: true

module Seed
    module Types
        # This is a simple union.
        class Union < Internal::Types::Union

            discriminant :type

            member -> { Seed::Types::Foo }, key: "FOO"
            member -> { Seed::Types::Bar }, key: "BAR"
    end
end
