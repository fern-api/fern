
module Seed
    module Types
        class Tree < Internal::Types::Model
            field :nodes, Internal::Types::Array[Seed::Node], optional: true, nullable: false

    end
end
