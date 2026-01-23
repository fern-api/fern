# frozen_string_literal: true

module FernAcceptHeader
  module Internal
    module Types
      module Unknown
        include FernAcceptHeader::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
