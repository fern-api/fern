# frozen_string_literal: true

module Seed
    module Types
        class Shape < Internal::Types::Union

            discriminant :type

            member -> { Seed::Union::Circle }, key: "CIRCLE"
            member -> { Seed::Union::Square }, key: "SQUARE"
    end
end
