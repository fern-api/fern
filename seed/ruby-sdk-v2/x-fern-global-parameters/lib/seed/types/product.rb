# frozen_string_literal: true

module Seed
  module Types
    class Product < Internal::Types::Model
      field :id, -> { String }, optional: true, nullable: false

      field :name, -> { String }, optional: true, nullable: false

      field :price, -> { Integer }, optional: true, nullable: false
    end
  end
end
