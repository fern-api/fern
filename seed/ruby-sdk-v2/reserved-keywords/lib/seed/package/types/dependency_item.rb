# frozen_string_literal: true

module Seed
  module Package
    module Types
      class DependencyItem < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Package::Types::KnownDependency }, key: "KNOWN"

        member -> { Seed::Package::Types::KnownDependency }, key: "UNKNOWN"
      end
    end
  end
end
