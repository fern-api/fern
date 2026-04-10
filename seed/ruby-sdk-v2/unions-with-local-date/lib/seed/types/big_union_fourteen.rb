# frozen_string_literal: true

module Seed
  module Types
    class BigUnionFourteen < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionFourteenType }, optional: false, nullable: false
    end
  end
end
