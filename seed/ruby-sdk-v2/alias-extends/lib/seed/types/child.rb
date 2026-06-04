# frozen_string_literal: true

module Seed
  module Types
    class Child < Internal::Types::Model
      field :parent, -> { String }, optional: false, nullable: false

      field :child, -> { String }, optional: false, nullable: false
    end
  end
end
