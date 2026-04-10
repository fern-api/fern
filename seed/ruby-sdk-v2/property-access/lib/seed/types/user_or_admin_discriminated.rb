# frozen_string_literal: true

module Seed
  module Types
    # Example of an discriminated union
    class UserOrAdminDiscriminated < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::User }, key: "USER"
      member -> { Seed::Types::Admin }, key: "ADMIN"
      member -> { Object }, key: "EMPTY"
    end
  end
end
