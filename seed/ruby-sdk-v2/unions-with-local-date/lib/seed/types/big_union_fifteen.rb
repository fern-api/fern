# frozen_string_literal: true

module Seed
  module Types
    class BigUnionFifteen < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionFifteenType }, optional: false, nullable: false
    end
  end
end
