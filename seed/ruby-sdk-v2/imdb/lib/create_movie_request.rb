# frozen_string_literal: true

module Imdb
    module Types
        class CreateMovieRequest < Internal::Types::Model
            field :title, String, optional: true, nullable: true
            field :rating, Float, optional: true, nullable: true
        end
    end
end
