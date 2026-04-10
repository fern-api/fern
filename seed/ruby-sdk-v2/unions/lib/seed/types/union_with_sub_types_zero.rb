# frozen_string_literal: true

module Seed
  module Types
    class UnionWithSubTypesZero < Internal::Types::Model
      field :type, -> { Seed::Types::UnionWithSubTypesZeroType }, optional: false, nullable: false
    end
  end
end
