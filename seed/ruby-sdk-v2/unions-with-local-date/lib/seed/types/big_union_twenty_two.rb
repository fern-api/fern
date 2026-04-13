# frozen_string_literal: true

module Seed
  module Types
    class BigUnionTwentyTwo < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionTwentyTwoType }, optional: false, nullable: false
    end
  end
end
