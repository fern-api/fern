# frozen_string_literal: true

module FernImdb
  module Internal
    module Types
      module Unknown
        include FernImdb::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
