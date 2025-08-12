
module Seed
    module Types
        class BinaryTreeNodeValue < Internal::Types::Model
            field :node_id, , optional: false, nullable: false
            field :val, , optional: false, nullable: false
            field :right, , optional: true, nullable: false
            field :left, , optional: true, nullable: false
        end
    end
end
