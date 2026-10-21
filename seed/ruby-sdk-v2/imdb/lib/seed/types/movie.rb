# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class Movie < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false

      field :title, -> { String }, optional: false, nullable: false

      field :rating, -> { Float }, optional: false, nullable: false
    end
  end
end
