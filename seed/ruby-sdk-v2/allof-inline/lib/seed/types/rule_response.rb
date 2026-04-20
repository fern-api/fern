# frozen_string_literal: true

module Seed
  module Types
    class RuleResponse < Internal::Types::Model
      field :created_by, -> { String }, optional: true, nullable: false, api_name: "createdBy"
      field :created_date_time, -> { String }, optional: true, nullable: false, api_name: "createdDateTime"
      field :modified_by, -> { String }, optional: true, nullable: false, api_name: "modifiedBy"
      field :modified_date_time, -> { String }, optional: true, nullable: false, api_name: "modifiedDateTime"
      field :id, -> { String }, optional: false, nullable: false
      field :name, -> { String }, optional: false, nullable: false
      field :status, -> { Seed::Types::RuleResponseStatus }, optional: false, nullable: false
      field :execution_context, -> { Seed::Types::RuleExecutionContext }, optional: true, nullable: false, api_name: "executionContext"
    end
  end
end
