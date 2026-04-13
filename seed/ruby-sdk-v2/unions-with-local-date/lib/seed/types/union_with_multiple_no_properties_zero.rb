# frozen_string_literal: true

module Seed
  module Types
    class UnionWithMultipleNoPropertiesZero < Internal::Types::Model
      field :type, -> { Seed::Types::UnionWithMultipleNoPropertiesZeroType }, optional: false, nullable: false
    end
  end
end
