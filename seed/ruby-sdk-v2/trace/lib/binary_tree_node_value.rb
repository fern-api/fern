# frozen_string_literal: true

module Commons
    module Types
        class BinaryTreeNodeValue < Internal::Types::Model
            field :node_id, NodeId, optional: true, nullable: true
            field :val, Float, optional: true, nullable: true
            field :right, Array, optional: true, nullable: true
            field :left, Array, optional: true, nullable: true
        end
    end
end
