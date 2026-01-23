# frozen_string_literal: true

module FernMixedFileDirectory
  module Internal
    module Types
      module Unknown
        include FernMixedFileDirectory::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
