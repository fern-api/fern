# frozen_string_literal: true

module FernFileUpload
  module Internal
    module Types
      module Unknown
        include FernFileUpload::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
