# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class BinaryTreeNodeValue < Internal::Types::Model
        field :node_id, -> { String }, optional: false, nullable: false
        field :val, -> { Integer }, optional: false, nullable: false
        field :right, -> { String }, optional: true, nullable: false
        field :left, -> { String }, optional: true, nullable: false
      end
    end
  end
end
