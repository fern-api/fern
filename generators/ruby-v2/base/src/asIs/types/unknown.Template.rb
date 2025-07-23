# frozen_string_literal: true

module <%= gem_namespace %>
  module Internal
    module Types
      module Unknown
        include Type

        def coerce(value)
          value
        end
      end
    end
  end
end 