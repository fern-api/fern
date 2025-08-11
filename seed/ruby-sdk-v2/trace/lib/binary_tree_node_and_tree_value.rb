# frozen_string_literal: true

module Commons
    module Types
        class BinaryTreeNodeAndTreeValue < Internal::Types::Model
            field :node_id, NodeId, optional: true, nullable: true
            field :full_tree, BinaryTreeValue, optional: true, nullable: true
        end
    end
end
