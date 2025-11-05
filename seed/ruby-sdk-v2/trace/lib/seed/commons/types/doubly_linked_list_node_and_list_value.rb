# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class DoublyLinkedListNodeAndListValue < Internal::Types::Model
        field :node_id, -> { String }, optional: false, nullable: false, api_name: "nodeId"
        field :full_list, lambda {
          Seed::Commons::Types::DoublyLinkedListValue
        }, optional: false, nullable: false, api_name: "fullList"
      end
    end
  end
end
