# frozen_string_literal: true

module Seed
  module Types
    class TreeIdentifiable < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false
    end
  end
end
