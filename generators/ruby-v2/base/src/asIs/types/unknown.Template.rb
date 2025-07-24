# frozen_string_literal: true

module <%= gem_namespace %>
  module Internal
    module Types
      module Unknown
        include <%= gem_namespace %>::Internal::Types::Type

        def coerce(value)
          value
        end
      end
    end
  end
end 