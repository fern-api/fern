# frozen_string_literal: true

module FernErrors
  module Internal
    module Types
      module Unknown
        include FernErrors::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
