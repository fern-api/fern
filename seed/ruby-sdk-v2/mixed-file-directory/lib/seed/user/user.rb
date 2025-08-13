
module Seed
    module Types
        class User < Internal::Types::Model
            field :id, String, optional: false, nullable: false
            field :name, String, optional: false, nullable: false
            field :age, Integer, optional: false, nullable: false

    end
end
