# frozen_string_literal: true

module Seed
    module Types
        class CustomFiles < Internal::Types::Union

            discriminant :type

            member -> { Seed::V2::V3::Problem::BasicCustomFiles }, key: "BASIC"
            member -> { Internal::Types::Hash[Seed::Commons::Language, Seed::V2::V3::Problem::Files] }, key: "CUSTOM"
    end
end
