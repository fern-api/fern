# frozen_string_literal: true

module FernDollarStringExamples
  module Internal
    module Types
      module Unknown
        include FernDollarStringExamples::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
