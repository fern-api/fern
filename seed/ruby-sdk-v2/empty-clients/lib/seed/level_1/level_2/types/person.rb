# frozen_string_literal: true

module Seed
    module Types
        class Person < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :address, Seed::Level1::Level2::Types::Address, optional: false, nullable: false

    end
end
