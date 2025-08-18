# frozen_string_literal: true

module Seed
    module Types
        class Test < Internal::Types::Union

            discriminant :type

            member -> { Internal::Types::Boolean }, key: "AND"
            member -> { Internal::Types::Boolean }, key: "OR"
    end
end
