# frozen_string_literal: true

module Seed
    module Types
        class Metadata < Internal::Types::Union

            discriminant :type

            member -> { String }, key: "HTML"
            member -> { String }, key: "MARKDOWN"
    end
end
