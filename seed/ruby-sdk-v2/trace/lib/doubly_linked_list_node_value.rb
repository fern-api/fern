# frozen_string_literal: true

module Commons
    module Types
        class DoublyLinkedListNodeValue < Internal::Types::Model
            field :node_id, NodeId, optional: true, nullable: true
            field :val, Float, optional: true, nullable: true
            field :next_, Array, optional: true, nullable: true
            field :prev, Array, optional: true, nullable: true
        end
    end
end
