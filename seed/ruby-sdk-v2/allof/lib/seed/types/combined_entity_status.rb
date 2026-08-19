# frozen_string_literal: true

module Seed
  module Types
    module CombinedEntityStatus
      extend Seed::Internal::Types::Enum

      ACTIVE = "active"
      ARCHIVED = "archived"
    end
  end
end
