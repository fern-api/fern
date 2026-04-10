# frozen_string_literal: true

module Seed
  module Types
    class BigUnionFive < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionFiveType }, optional: false, nullable: false
    end
  end
end
