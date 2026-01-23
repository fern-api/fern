# frozen_string_literal: true

module FernMixedCase
  module Service
    module Types
      class Resource < Internal::Types::Model
        extend FernMixedCase::Internal::Types::Union

        discriminant :resource_type

        member -> { FernMixedCase::Service::Types::User }, key: "USER"
        member -> { FernMixedCase::Service::Types::Organization }, key: "ORGANIZATION"
      end
    end
  end
end
