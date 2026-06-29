# frozen_string_literal: true

module Seed
  module Reporting
    module Types
      module LoadRequestCache
        extend Seed::Internal::Types::Enum

        STALE_IF_SLOW = "stale-if-slow"
        NO_CACHE = "no-cache"
      end
    end
  end
end
