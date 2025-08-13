# frozen_string_literal: true

module Seed
    module Types
        class U < Internal::Types::Model
            field :child, Seed::Ast::T, optional: false, nullable: false

    end
end
