# frozen_string_literal: true

module Seed
  module Types
    module RuleExecutionContext
      extend Seed::Internal::Types::Enum

      PROD = "prod"
      STAGING = "staging"
      DEV = "dev"
    end
  end
end
