
module Seed
    module Types
        class Node < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :nodes, Internal::Types::Array[Seed::types::Node], optional: true, nullable: false
            field :trees, Internal::Types::Array[Seed::types::Tree], optional: true, nullable: false

    end
end
