# frozen_string_literal: true

module Seed
  module Types
    class BigUnionNine < Internal::Types::Model
      field :type, -> { Seed::Types::BigUnionNineType }, optional: false, nullable: false
    end
  end
end
