
module Seed
    module Types
        class ATopLevelLiteral < Internal::Types::Model
            field :nested_literal, Seed::inlined::ANestedLiteral, optional: false, nullable: false

    end
end
