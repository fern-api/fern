# frozen_string_literal: true

module FernBytesDownload
  module Internal
    module Types
      module Unknown
        include FernBytesDownload::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
