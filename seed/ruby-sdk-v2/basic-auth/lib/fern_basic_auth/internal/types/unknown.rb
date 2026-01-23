# frozen_string_literal: true

module FernBasicAuth
  module Internal
    module Types
      module Unknown
        include FernBasicAuth::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
