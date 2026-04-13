# frozen_string_literal: true

module Seed
  module Types
    class BigUnionFour < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionFourType }, optional: false, nullable: false
    end
  end
end
