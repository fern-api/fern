# frozen_string_literal: true

module Seed
  module Types
    # Example of an discriminated union
    class UserOrAdminDiscriminated < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::UserOrAdminDiscriminatedZero }
      member -> { Seed::Types::UserOrAdminDiscriminatedAdmin }
      member -> { Seed::Types::UserOrAdminDiscriminatedTwo }
    end
  end
end
