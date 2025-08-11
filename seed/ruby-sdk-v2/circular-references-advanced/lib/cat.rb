# frozen_string_literal: true

module Ast
    module Types
        class Cat < Internal::Types::Model
            field :fruit, Fruit, optional: true, nullable: true
        end
    end
end
