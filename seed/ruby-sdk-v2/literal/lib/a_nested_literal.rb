# frozen_string_literal: true

module Inlined
    module Types
        class ANestedLiteral < Internal::Types::Model
            field :my_literal, Array, optional: true, nullable: true
        end
    end
end
