# frozen_string_literal: true

module Seed
  module Types
    class RuleResponse < Internal::Types::Model
      field :id, -> { String }, optional: false, nullable: false

      field :name, -> { String }, optional: false, nullable: false

      field :status, -> { Seed::Types::RuleResponseStatus }, optional: false, nullable: false

      field :execution_context, -> { Seed::Types::RuleExecutionContext }, optional: true, nullable: false, api_name: "executionContext"
    end
  end
end
