# frozen_string_literal: true

module Seed
  module Types
    class UnionWithBaseProperties < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::UnionWithBasePropertiesZero }
      member -> { Seed::Types::UnionWithBasePropertiesOne }
      member -> { Seed::Types::UnionWithBasePropertiesTwo }
    end
  end
end
