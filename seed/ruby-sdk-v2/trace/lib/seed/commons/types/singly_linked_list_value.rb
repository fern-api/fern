# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class SinglyLinkedListValue < Internal::Types::Model
        field :head, -> { String }, optional: true, nullable: false
        field :nodes, lambda {
          Internal::Types::Hash[String, Seed::Commons::Types::SinglyLinkedListNodeValue]
        }, optional: false, nullable: false
      end
    end
  end
end
