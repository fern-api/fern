
module Seed
    module Types
        class BinaryTreeValue < Internal::Types::Model
            field :root, , optional: true, nullable: false
            field :nodes, , optional: false, nullable: false
        end
    end
end
