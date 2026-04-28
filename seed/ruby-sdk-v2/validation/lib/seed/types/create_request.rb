# frozen_string_literal: true

module Seed
  module Types
    class CreateRequest < Internal::Types::Model
      field :decimal, -> { Integer }, optional: false, nullable: false
      field :even, -> { Integer }, optional: false, nullable: false
      field :name, -> { String }, optional: false, nullable: false
      field :shape, -> { Seed::Types::Shape }, optional: false, nullable: false
    end
  end
end
