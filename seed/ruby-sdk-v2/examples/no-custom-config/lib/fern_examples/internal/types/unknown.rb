# frozen_string_literal: true

module FernExamples
  module Internal
    module Types
      module Unknown
        include FernExamples::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
