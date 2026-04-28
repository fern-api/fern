# frozen_string_literal: true

module Seed
  module Types
    class RuleCreateRequest < Internal::Types::Model
      field :name, -> { String }, optional: false, nullable: false
      field :execution_context, -> { Seed::Types::RuleExecutionContext }, optional: false, nullable: false, api_name: "executionContext"
    end
  end
end
