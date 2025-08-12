
module Seed
    module Types
        class Node < Internal::Types::Model
            field :name, , optional: false, nullable: false
            field :nodes, , optional: true, nullable: false
            field :trees, , optional: true, nullable: false
        end
    end
end
