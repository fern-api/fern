# frozen_string_literal: true

module Seed
    module Types
        class WithPage < Internal::Types::Model
            field :page, Integer, optional: true, nullable: false

    end
end
