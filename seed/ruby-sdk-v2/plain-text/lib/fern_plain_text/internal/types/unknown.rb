# frozen_string_literal: true

module FernPlainText
  module Internal
    module Types
      module Unknown
        include FernPlainText::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end
