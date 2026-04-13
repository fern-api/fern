# frozen_string_literal: true

module Seed
  module Types
    class BigUnionTwentyOne < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionTwentyOneType }, optional: false, nullable: false
    end
  end
end
