# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class DoublyLinkedListNodeValue < Internal::Types::Model
        field :node_id, -> { String }, optional: false, nullable: false, api_name: "nodeId"
        field :val, -> { Integer }, optional: false, nullable: false
        field :next_, -> { String }, optional: true, nullable: false, api_name: "next"
        field :prev, -> { String }, optional: true, nullable: false
      end
    end
  end
end
