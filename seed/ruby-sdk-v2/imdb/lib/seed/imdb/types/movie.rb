# frozen_string_literal: true

module Seed
  module Imdb
    module Types
      class Movie < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :title, -> { String }, optional: false, nullable: false
        field :rating, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
