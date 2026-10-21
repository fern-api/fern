# frozen_string_literal: true

require_relative "../.."

module Seed
  module Commons
    module Types
      class BinaryTreeValue < Internal::Types::Model
        field :root, -> { String }, optional: true, nullable: false

        field :nodes, -> { Internal::Types::Hash[String, Seed::Commons::Types::BinaryTreeNodeValue] }, optional: false, nullable: false
      end
    end
  end
end
