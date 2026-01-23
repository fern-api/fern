# frozen_string_literal: true

module FernTrace
  module Commons
    module Types
      class SinglyLinkedListNodeAndListValue < Internal::Types::Model
        field :node_id, -> { String }, optional: false, nullable: false, api_name: "nodeId"
        field :full_list, -> { FernTrace::Commons::Types::SinglyLinkedListValue }, optional: false, nullable: false, api_name: "fullList"
      end
    end
  end
end
