# frozen_string_literal: true

require_relative "../.."

module Seed
  module Service
    module Types
      class Resource < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :resource_type

        member -> { Seed::Service::Types::User }, key: "USER"

        member -> { Seed::Service::Types::Organization }, key: "ORGANIZATION"
      end
    end
  end
end
