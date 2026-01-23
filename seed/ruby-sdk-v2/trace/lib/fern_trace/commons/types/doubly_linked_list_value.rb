# frozen_string_literal: true

module FernTrace
  module Commons
    module Types
      class DoublyLinkedListValue < Internal::Types::Model
        field :head, -> { String }, optional: true, nullable: false
        field :nodes, -> { Internal::Types::Hash[String, FernTrace::Commons::Types::DoublyLinkedListNodeValue] }, optional: false, nullable: false
      end
    end
  end
end
