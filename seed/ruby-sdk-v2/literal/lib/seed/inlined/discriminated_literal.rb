# frozen_string_literal: true

module Seed
    module Types
        class DiscriminatedLiteral < Internal::Types::Union

            discriminant :type

            member -> { String }, key: "CUSTOM_NAME"
            member -> { String }, key: "DEFAULT_NAME"
            member -> { Internal::Types::Boolean }, key: "GEORGE"
            member -> { Internal::Types::Boolean }, key: "LITERAL_GEORGE"
    end
end
