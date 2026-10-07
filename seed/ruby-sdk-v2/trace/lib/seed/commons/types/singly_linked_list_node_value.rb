# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class SinglyLinkedListNodeValue < Internal::Types::Model
        field :node_id, -> { String }, optional: false, nullable: false, api_name: "nodeId"

        field :val, -> { Float }, optional: false, nullable: false

        field :next_, -> { String }, optional: true, nullable: false, api_name: "next"
      end
    end
  end
end
