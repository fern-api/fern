
module Seed
    module Types
        class Entity < Internal::Types::Model
            field :type, Seed::Type, optional: false, nullable: false
            field :name, String, optional: false, nullable: false
        end
    end
end
