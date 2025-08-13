
module Seed
    module Types
        class DoublyLinkedListValue < Internal::Types::Model
            field :head, String, optional: true, nullable: false
            field :nodes, Internal::Types::Hash[String, Seed::commons::DoublyLinkedListNodeValue], optional: false, nullable: false

    end
end
