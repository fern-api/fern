# frozen_string_literal: true

module Seed
  module Types
    class BigUnionTwentyFour < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionTwentyFourType }, optional: false, nullable: false
    end
  end
end
