# frozen_string_literal: true

module Seed
  module Types
    module RuleCreateRequestExecutionContext
      extend Seed::Internal::Types::Enum

      PROD = "prod"
      STAGING = "staging"
      DEV = "dev"
    end
  end
end
