# frozen_string_literal: true

module Inlined
    module Types
        class ATopLevelLiteral < Internal::Types::Model
            field :nested_literal, ANestedLiteral, optional: true, nullable: true
        end
    end
end
