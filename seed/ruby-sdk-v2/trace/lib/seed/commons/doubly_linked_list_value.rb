# frozen_string_literal: true

module Seed
    module Types
        class DoublyLinkedListValue < Internal::Types::Model
            field :head, String, optional: true, nullable: false
            field :nodes, Internal::Types::Hash[String, Seed::Commons::DoublyLinkedListNodeValue], optional: false, nullable: false

    end
end
