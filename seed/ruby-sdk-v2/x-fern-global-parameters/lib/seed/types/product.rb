# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class Product < Internal::Types::Model
      field :id, -> { String }, optional: true, nullable: false

      field :name, -> { String }, optional: true, nullable: false

      field :price, -> { Float }, optional: true, nullable: false
    end
  end
end
