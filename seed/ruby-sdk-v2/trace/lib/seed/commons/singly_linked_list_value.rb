
module Seed
    module Types
        class SinglyLinkedListValue < Internal::Types::Model
            field :head, String, optional: true, nullable: false
            field :nodes, Internal::Types::Hash[String, Seed::commons::SinglyLinkedListNodeValue], optional: false, nullable: false

    end
end
