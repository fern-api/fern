# frozen_string_literal: true

module Seed
  module Types
    class Key < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::KeyType }
      member -> { Seed::Types::KeyOne }
    end
  end
end
