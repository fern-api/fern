
module Seed
    module Types
        class BranchNode < Internal::Types::Model
            field :children, Internal::Types::Array[Seed::ast::Node], optional: false, nullable: false
        end
    end
end
