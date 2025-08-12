
module Seed
    module Types
        class SinglyLinkedListNodeValue < Internal::Types::Model
            field :node_id, , optional: false, nullable: false
            field :val, , optional: false, nullable: false
            field :next_, , optional: true, nullable: false
        end
    end
end
