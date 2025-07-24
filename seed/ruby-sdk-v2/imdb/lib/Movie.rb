# frozen_string_literal: true

module Imdb
    module Types
        class Movie < Internal::Types::Model
            field :id, MovieId, optional: true, nullable: true
            field :title, String, optional: true, nullable: true
            field :rating, Float, optional: true, nullable: true
        end
    end
end
