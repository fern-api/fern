# frozen_string_literal: true

module Ast
    module Types
        class U < Internal::Types::Model
            field :child, T, optional: true, nullable: true
        end
    end
end
