
module Seed
    module Types
        class CreateMovieRequest < Internal::Types::Model
            field :title, String, optional: false, nullable: false
            field :rating, Integer, optional: false, nullable: false
        end
    end
end
