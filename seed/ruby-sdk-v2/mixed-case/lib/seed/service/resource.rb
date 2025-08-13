# frozen_string_literal: true

module Seed
    module Types
        class Resource < Internal::Types::Union

            discriminant :resource_type

            member -> { Seed::Service::User }, key: "USER"
            member -> { Seed::Service::Organization }, key: "ORGANIZATION"
    end
end
