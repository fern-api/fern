# frozen_string_literal: true

module Seed
  module Types
    class UnionWithDuplicateTypesZero < Internal::Types::Model
      field :type, -> { Seed::Types::UnionWithDuplicateTypesZeroType }, optional: false, nullable: false
    end
  end
end
