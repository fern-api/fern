# frozen_string_literal: true

module Seed
    module Types
        class BinaryTreeValue < Internal::Types::Model
            field :root, String, optional: true, nullable: false
            field :nodes, Internal::Types::Hash[String, Seed::Commons::BinaryTreeNodeValue], optional: false, nullable: false

    end
end
