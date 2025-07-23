# frozen_string_literal: true

module Commons
    module Types
        class SinglyLinkedListNodeAndListValue < Internal::Types::Model
            field :node_id, NodeId, optional: true, nullable: true
            field :full_list, SinglyLinkedListValue, optional: true, nullable: true
        end
    end
end
