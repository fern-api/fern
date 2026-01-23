# frozen_string_literal: true

module FernWebhookAudience
  module Internal
    module Types
      module Unknown
        include FernWebhookAudience::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
