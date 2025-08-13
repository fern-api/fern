
module Seed
    module Types
        class SinglyLinkedListNodeAndListValue < Internal::Types::Model
            field :node_id, String, optional: false, nullable: false
            field :full_list, Seed::commons::SinglyLinkedListValue, optional: false, nullable: false
        end
    end
end
