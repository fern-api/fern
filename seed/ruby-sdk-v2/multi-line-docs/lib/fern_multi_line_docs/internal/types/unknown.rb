# frozen_string_literal: true

module FernMultiLineDocs
  module Internal
    module Types
      module Unknown
        include FernMultiLineDocs::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
