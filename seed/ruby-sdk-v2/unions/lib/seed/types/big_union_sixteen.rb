# frozen_string_literal: true

module Seed
  module Types
    class BigUnionSixteen < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionSixteenType }, optional: false, nullable: false
    end
  end
end
