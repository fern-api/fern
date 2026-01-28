# frozen_string_literal: true

module FernExamples
  module Types
    class TypeWithSingleCharPropertyEqualToTypeStartingLetter < Internal::Types::Model
      field :t, -> { String }, optional: false, nullable: false
      field :ty, -> { String }, optional: false, nullable: false
    end
  end
end
