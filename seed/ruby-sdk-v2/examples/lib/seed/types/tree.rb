
module Seed
    module Types
        class Tree < Internal::Types::Model
            field :nodes, Internal::Types::Array[Seed::types::Node], optional: true, nullable: false

    end
end
