# frozen_string_literal: true

module Seed
    module Types
        class Fig < Internal::Types::Model
            field :animal, Seed::Ast::Animal, optional: false, nullable: false

    end
end
