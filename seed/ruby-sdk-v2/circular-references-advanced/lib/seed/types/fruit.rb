# frozen_string_literal: true

module Seed
  module Types
    class Fruit < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::Berry }
      member -> { Seed::Types::Fig }
    end
  end
end
