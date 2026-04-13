# frozen_string_literal: true

module Seed
  module Types
    class BigUnionTwenty < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionTwentyType }, optional: false, nullable: false
    end
  end
end
