# frozen_string_literal: true

module Seed
  module Types
    class UnionWithNoProperties < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::UnionWithNoPropertiesZero }
      member -> { Seed::Types::UnionWithNoPropertiesType }
    end
  end
end
