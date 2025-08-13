# frozen_string_literal: true

module Seed
    module Types
        class EventInfo < Internal::Types::Union

            discriminant :type

            member -> { Seed::Commons::Types::Metadata }, key: "METADATA"
            member -> { String }, key: "TAG"
    end
end
