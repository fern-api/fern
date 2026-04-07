# frozen_string_literal: true

module Seed
  module Types
    class Plant < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false
      field :name, -> { String }, optional: false, nullable: false
      field :species, -> { String }, optional: true, nullable: false
    end
  end
end
