# frozen_string_literal: true

module Seed
    module Types
        class SinglyLinkedListNodeAndListValue < Internal::Types::Model
            field :node_id, String, optional: false, nullable: false
            field :full_list, Seed::Commons::SinglyLinkedListValue, optional: false, nullable: false

    end
end
