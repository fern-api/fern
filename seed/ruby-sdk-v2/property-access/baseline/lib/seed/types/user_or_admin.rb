# frozen_string_literal: true

module Seed
  module Types
    # Example of an undiscriminated union
    class UserOrAdmin < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::User }
      member -> { Seed::Types::Admin }
    end
  end
end
