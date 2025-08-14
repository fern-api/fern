# frozen_string_literal: true

module Seed
    module Types
        class BranchNode < Internal::Types::Model
            field :children, Internal::Types::Array[Seed::Ast::Node], optional: false, nullable: false

    end
end
