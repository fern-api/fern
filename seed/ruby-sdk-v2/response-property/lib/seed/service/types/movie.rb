# frozen_string_literal: true

module Seed
  module Service
    module Types
      class Movie < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
