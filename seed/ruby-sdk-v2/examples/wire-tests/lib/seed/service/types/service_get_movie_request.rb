# frozen_string_literal: true

module Seed
  module Service
    module Types
      class ServiceGetMovieRequest < Internal::Types::Model
        field :movie_id, -> { String }, optional: false, nullable: false, api_name: "movieId"
      end
    end
  end
end
