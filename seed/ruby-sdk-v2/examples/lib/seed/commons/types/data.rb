# frozen_string_literal: true

module Seed
    module Types
        class Data < Internal::Types::Union

            discriminant :type

            member -> { String }, key: "STRING"
            member -> { String }, key: "BASE_64"
    end
end
