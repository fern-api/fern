# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    module CombinedEntityStatus
      extend Seed::Internal::Types::Enum

      ACTIVE = "active"
      ARCHIVED = "archived"
    end
  end
end
