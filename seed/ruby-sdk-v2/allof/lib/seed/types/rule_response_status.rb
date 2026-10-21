# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    module RuleResponseStatus
      extend Seed::Internal::Types::Enum

      ACTIVE = "active"
      INACTIVE = "inactive"
      DRAFT = "draft"
    end
  end
end
