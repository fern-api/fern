
module Seed
    module Types
        class CreateMovieRequest < Internal::Types::Model
            field :title, , optional: false, nullable: false
            field :rating, , optional: false, nullable: false
        end
    end
end
