# frozen_string_literal: true

module Seed
  module Types
    class BigUnionSix < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionSixType }, optional: false, nullable: false
    end
  end
end
