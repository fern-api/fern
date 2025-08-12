
module Seed
    module Types
        class DoublyLinkedListValue < Internal::Types::Model
            field :head, , optional: true, nullable: false
            field :nodes, , optional: false, nullable: false
        end
    end
end
