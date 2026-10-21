# frozen_string_literal: true

require_relative ".."

module Seed
  module Types
    class TypeWithSingleCharPropertyEqualToTypeStartingLetter < Internal::Types::Model
      field :t, -> { String }, optional: false, nullable: false

      field :ty, -> { String }, optional: false, nullable: false
    end
  end
end
