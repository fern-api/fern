# frozen_string_literal: true

module Ast
    module Types
        class Fig < Internal::Types::Model
            field :animal, Animal, optional: true, nullable: true
        end
    end
end
