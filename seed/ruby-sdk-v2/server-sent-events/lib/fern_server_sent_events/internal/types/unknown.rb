# frozen_string_literal: true

module FernServerSentEvents
  module Internal
    module Types
      module Unknown
        include FernServerSentEvents::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
