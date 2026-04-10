# frozen_string_literal: true

module Seed
  module Types
    class BigUnionTwentyThree < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionTwentyThreeType }, optional: false, nullable: false
    end
  end
end
