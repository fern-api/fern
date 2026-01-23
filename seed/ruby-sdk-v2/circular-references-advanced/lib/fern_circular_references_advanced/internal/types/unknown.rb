# frozen_string_literal: true

module FernCircularReferencesAdvanced
  module Internal
    module Types
      module Unknown
        include FernCircularReferencesAdvanced::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
