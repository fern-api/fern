# frozen_string_literal: true

module Ast
    module Types
        class NodesWrapper < Internal::Types::Model
            field :nodes, Array, optional: true, nullable: true
        end
    end
end
