# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class BinaryTreeValue < Internal::Types::Model
        field :root, -> { String }, optional: true, nullable: false
        field :nodes, lambda {
          Internal::Types::Hash[String, Seed::Commons::Types::BinaryTreeNodeValue]
        }, optional: false, nullable: false
      end
    end
  end
end
