# frozen_string_literal: true

require_relative "../.."

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
