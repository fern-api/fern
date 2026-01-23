# frozen_string_literal: true

module FernBytesUpload
  module Internal
    module Types
      module Unknown
        include FernBytesUpload::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
