# frozen_string_literal: true

module Seed
  module Types
    class SinglyLinkedListNodeAndListValue < Internal::Types::Model
      field :node_id, -> { String }, optional: false, nullable: false, api_name: "nodeId"
      field :full_list, -> { Seed::Types::SinglyLinkedListValue }, optional: false, nullable: false, api_name: "fullList"
    end
  end
end
