# frozen_string_literal: true

module Seed
    module Types
        class Animal < Internal::Types::Union

            discriminant :animal

            member -> { Seed::Types::Union::Dog }, key: "DOG"
            member -> { Seed::Types::Union::Cat }, key: "CAT"
    end
end
