# frozen_string_literal: true

module Seed
  module Types
    class Animal < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::Cat }
      member -> { Seed::Types::Dog }
    end
  end
end
