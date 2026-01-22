# frozen_string_literal: true

module FernLicense
  module Internal
    module Types
      module Unknown
        include FernLicense::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
