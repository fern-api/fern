# frozen_string_literal: true

module FernFolders
  module Internal
    module Types
      module Unknown
        include FernFolders::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
