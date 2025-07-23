# frozen_string_literal: true

module Commons
    module Types
        class DoublyLinkedListNodeAndListValue < Internal::Types::Model
            field :node_id, NodeId, optional: true, nullable: true
            field :full_list, DoublyLinkedListValue, optional: true, nullable: true
        end
    end
end
