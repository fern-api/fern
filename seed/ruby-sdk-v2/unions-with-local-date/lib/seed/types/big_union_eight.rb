# frozen_string_literal: true

module Seed
  module Types
    class BigUnionEight < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionEightType }, optional: false, nullable: false
    end
  end
end
