# frozen_string_literal: true

module Seed
  module Types
    class UnionWithSingleElement < Internal::Types::Model
      field :type, -> { Seed::Types::UnionWithSingleElementType }, optional: false, nullable: false
    end
  end
end
