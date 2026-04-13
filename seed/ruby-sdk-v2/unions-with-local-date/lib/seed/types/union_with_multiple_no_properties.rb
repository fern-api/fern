# frozen_string_literal: true

module Seed
  module Types
    class UnionWithMultipleNoProperties < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::UnionWithMultipleNoPropertiesZero }
      member -> { Seed::Types::UnionWithMultipleNoPropertiesOne }
      member -> { Seed::Types::UnionWithMultipleNoPropertiesTwo }
    end
  end
end
