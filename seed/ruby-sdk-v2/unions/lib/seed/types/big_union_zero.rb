# frozen_string_literal: true

module Seed
  module Types
    class BigUnionZero < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionZeroType }, optional: false, nullable: false
    end
  end
end
