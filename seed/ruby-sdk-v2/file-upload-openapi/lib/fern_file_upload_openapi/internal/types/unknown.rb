# frozen_string_literal: true

module FernFileUploadOpenapi
  module Internal
    module Types
      module Unknown
        include FernFileUploadOpenapi::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
