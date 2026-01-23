# frozen_string_literal: true

module FernPropertyAccess
  module Types
    # Example of an discriminated union
    class UserOrAdminDiscriminated < Internal::Types::Model
      extend FernPropertyAccess::Internal::Types::Union

      discriminant :type

      member -> { FernPropertyAccess::Types::User }, key: "USER"
      member -> { FernPropertyAccess::Types::Admin }, key: "ADMIN"
      member -> { Object }, key: "EMPTY"
    end
  end
end
