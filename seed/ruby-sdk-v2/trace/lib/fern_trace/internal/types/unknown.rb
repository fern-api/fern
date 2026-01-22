# frozen_string_literal: true

module FernTrace
  module Internal
    module Types
      module Unknown
        include FernTrace::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
