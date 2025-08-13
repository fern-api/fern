
module Seed
    module Types
        class Movie < Internal::Types::Model
            field :id, String, optional: false, nullable: false
            field :name, String, optional: false, nullable: false

    end
end
