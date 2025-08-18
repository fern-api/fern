# frozen_string_literal: true

module Seed
    module Types
        class ATopLevelLiteral < Internal::Types::Model
            field :nested_literal, Seed::Inlined::ANestedLiteral, optional: false, nullable: false

    end
end
