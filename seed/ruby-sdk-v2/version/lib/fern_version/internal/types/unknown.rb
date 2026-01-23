# frozen_string_literal: true

module FernVersion
  module Internal
    module Types
      module Unknown
        include FernVersion::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
