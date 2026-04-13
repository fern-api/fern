# frozen_string_literal: true

module Seed
  module Types
    class Resource < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::ResourceZero }
      member -> { Seed::Types::ResourceOne }
    end
  end
end
