# frozen_string_literal: true

module FernServerSentEventExamples
  module Internal
    module Types
      module Unknown
        include FernServerSentEventExamples::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
