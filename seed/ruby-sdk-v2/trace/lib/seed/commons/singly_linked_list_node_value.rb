# frozen_string_literal: true

module Seed
    module Types
        class SinglyLinkedListNodeValue < Internal::Types::Model
            field :node_id, String, optional: false, nullable: false
            field :val, Integer, optional: false, nullable: false
            field :next_, String, optional: true, nullable: false

    end
end
