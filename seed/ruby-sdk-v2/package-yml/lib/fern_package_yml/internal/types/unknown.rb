# frozen_string_literal: true

module FernPackageYml
  module Internal
    module Types
      module Unknown
        include FernPackageYml::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
