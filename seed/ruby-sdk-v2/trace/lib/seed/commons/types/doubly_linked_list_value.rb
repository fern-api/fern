# frozen_string_literal: true

require_relative "../.."

module Seed
  module Commons
    module Types
      class DoublyLinkedListValue < Internal::Types::Model
        field :head, -> { String }, optional: true, nullable: false

        field :nodes, -> { Internal::Types::Hash[String, Seed::Commons::Types::DoublyLinkedListNodeValue] }, optional: false, nullable: false
      end
    end
  end
end
