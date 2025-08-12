
module Seed
    module Types
        class BinaryTreeNodeAndTreeValue < Internal::Types::Model
            field :node_id, String, optional: false, nullable: false
            field :full_tree, Seed::commons::BinaryTreeValue, optional: false, nullable: false
        end
    end
end
