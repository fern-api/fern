# frozen_string_literal: true

module Seed
  module Types
    module Status
      extend Seed::Internal::Types::Enum

      KNOWN = "Known"
      UNKNOWN = "Unknown"
    end
  end
end
