
module Seed
    module Types
        class BinaryTreeValue < Internal::Types::Model
            field :root, String, optional: true, nullable: false
            field :nodes, Internal::Types::Hash[String, Seed::commons::BinaryTreeNodeValue], optional: false, nullable: false
        end
    end
end
