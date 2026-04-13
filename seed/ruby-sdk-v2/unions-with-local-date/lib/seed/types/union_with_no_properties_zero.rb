# frozen_string_literal: true

module Seed
  module Types
    class UnionWithNoPropertiesZero < Internal::Types::Model
      field :type, -> { Seed::Types::UnionWithNoPropertiesZeroType }, optional: false, nullable: false
    end
  end
end
