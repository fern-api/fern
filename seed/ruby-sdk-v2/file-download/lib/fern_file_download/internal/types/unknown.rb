# frozen_string_literal: true

module FernFileDownload
  module Internal
    module Types
      module Unknown
        include FernFileDownload::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
