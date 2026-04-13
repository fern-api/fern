# frozen_string_literal: true

module Seed
  module Types
    class BigUnionEighteen < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionEighteenType }, optional: false, nullable: false
    end
  end
end
