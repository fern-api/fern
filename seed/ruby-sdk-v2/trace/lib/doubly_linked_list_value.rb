# frozen_string_literal: true

module Commons
    module Types
        class DoublyLinkedListValue < Internal::Types::Model
            field :head, Array, optional: true, nullable: true
            field :nodes, Array, optional: true, nullable: true
        end
    end
end
