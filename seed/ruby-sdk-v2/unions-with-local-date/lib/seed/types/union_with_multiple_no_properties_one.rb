# frozen_string_literal: true

module Seed
  module Types
    class UnionWithMultipleNoPropertiesOne < Internal::Types::Model
      field :type, -> { Seed::Types::UnionWithMultipleNoPropertiesOneType }, optional: false, nullable: false
    end
  end
end
