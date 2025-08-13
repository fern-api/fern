
module Seed
    module Types
        class NodesWrapper < Internal::Types::Model
            field :nodes, Internal::Types::Array[Internal::Types::Array[Seed::ast::Node]], optional: false, nullable: false

    end
end
