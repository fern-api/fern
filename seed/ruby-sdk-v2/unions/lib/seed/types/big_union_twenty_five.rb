# frozen_string_literal: true

module Seed
  module Types
    class BigUnionTwentyFive < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionTwentyFiveType }, optional: false, nullable: false
    end
  end
end
