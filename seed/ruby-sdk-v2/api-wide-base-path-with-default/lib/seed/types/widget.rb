# frozen_string_literal: true

module Seed
  module Types
    class Widget < Internal::Types::Model
      field :name, -> { String }, optional: false, nullable: false
    end
  end
end
