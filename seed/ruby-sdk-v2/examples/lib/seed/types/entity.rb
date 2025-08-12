
module Seed
    module Types
        class Entity < Internal::Types::Model
            field :type, , optional: false, nullable: false
            field :name, , optional: false, nullable: false
        end
    end
end
