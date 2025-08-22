# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class BinaryTreeNodeAndTreeValue < Internal::Types::Model
        field :node_id, -> { String }, optional: false, nullable: false
        field :full_tree, -> { Seed::Commons::Types::BinaryTreeValue }, optional: false, nullable: false
      end
    end
  end
end
