# frozen_string_literal: true

module FernMixedCase
  module Internal
    module Types
      module Unknown
        include FernMixedCase::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
