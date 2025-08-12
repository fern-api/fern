
module Seed
    module Types
        class Movie < Internal::Types::Model
            field :id, , optional: false, nullable: false
            field :title, , optional: false, nullable: false
            field :rating, , optional: false, nullable: false
        end
    end
end
