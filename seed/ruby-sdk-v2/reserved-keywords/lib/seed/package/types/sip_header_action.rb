# frozen_string_literal: true

module Seed
  module Package
    module Types
      class SipHeaderAction < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Package::Types::CustomSipHeader }, key: "STATIC"

        member -> { Seed::Package::Types::CustomSipHeader }, key: "DYNAMIC"
      end
    end
  end
end
