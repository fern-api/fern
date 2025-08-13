
module Seed
    module Types
        class DoublyLinkedListNodeValue < Internal::Types::Model
            field :node_id, String, optional: false, nullable: false
            field :val, Integer, optional: false, nullable: false
            field :next_, String, optional: true, nullable: false
            field :prev, String, optional: true, nullable: false
        end
    end
end
