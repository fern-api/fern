# frozen_string_literal: true

module Seed
  module Types
    class BigUnionTwentyEight < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionTwentyEightType }, optional: false, nullable: false
    end
  end
end
