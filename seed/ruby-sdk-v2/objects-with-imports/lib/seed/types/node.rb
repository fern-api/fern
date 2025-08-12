
module Seed
    module Types
        class Node < Internal::Types::Model
            field :id, , optional: false, nullable: false
            field :label, , optional: true, nullable: false
            field :metadata, , optional: true, nullable: false
        end
    end
end
