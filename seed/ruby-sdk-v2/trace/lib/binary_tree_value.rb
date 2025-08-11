# frozen_string_literal: true

module Commons
    module Types
        class BinaryTreeValue < Internal::Types::Model
            field :root, Array, optional: true, nullable: true
            field :nodes, Array, optional: true, nullable: true
        end
    end
end
