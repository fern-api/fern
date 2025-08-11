# frozen_string_literal: true

module Ast
    module Types
        class BranchNode < Internal::Types::Model
            field :children, Array, optional: true, nullable: true
        end
    end
end
