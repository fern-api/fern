# frozen_string_literal: true

module FernTrace
  module Commons
    module Types
      class SinglyLinkedListValue < Internal::Types::Model
        field :head, -> { String }, optional: true, nullable: false
        field :nodes, -> { Internal::Types::Hash[String, FernTrace::Commons::Types::SinglyLinkedListNodeValue] }, optional: false, nullable: false
      end
    end
  end
end
