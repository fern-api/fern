# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class BinaryTreeNodeAndTreeValue < Internal::Types::Model
        field :node_id, -> { String }, optional: false, nullable: false, api_name: "nodeId"
        field :full_tree, lambda {
          Seed::Commons::Types::BinaryTreeValue
        }, optional: false, nullable: false, api_name: "fullTree"
      end
    end
  end
end
