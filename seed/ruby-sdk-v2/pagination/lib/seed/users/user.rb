
module Seed
    module Types
        class User < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :id, Integer, optional: false, nullable: false
        end
    end
end
