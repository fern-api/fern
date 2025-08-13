# frozen_string_literal: true

module Seed
    module Types
        class ANestedLiteral < Internal::Types::Model
            field :my_literal, String, optional: false, nullable: false

    end
end
