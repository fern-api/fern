# frozen_string_literal: true

module Seed
  module Types
    class ResourceList < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :resource_type

      member -> { Seed::Types::Account }, key: "ACCOUNT"
      member -> { Seed::Types::Patient }, key: "PATIENT"
      member -> { Seed::Types::Practitioner }, key: "PRACTITIONER"
      member -> { Seed::Types::Script }, key: "SCRIPT"
    end
  end
end
