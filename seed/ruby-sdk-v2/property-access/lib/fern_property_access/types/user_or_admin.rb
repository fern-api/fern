# frozen_string_literal: true

module FernPropertyAccess
  module Types
    # Example of an undiscriminated union
    class UserOrAdmin < Internal::Types::Model
      extend FernPropertyAccess::Internal::Types::Union

      member -> { FernPropertyAccess::Types::User }
      member -> { FernPropertyAccess::Types::Admin }
    end
  end
end
