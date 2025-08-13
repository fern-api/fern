
module Seed
    module Types
        class DoublyLinkedListNodeAndListValue < Internal::Types::Model
            field :node_id, String, optional: false, nullable: false
            field :full_list, Seed::commons::DoublyLinkedListValue, optional: false, nullable: false
        end
    end
end
