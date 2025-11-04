# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class ExecutionSessionState < Internal::Types::Model
        field :last_time_contacted, -> { String }, optional: true, nullable: false, api_name: "lastTimeContacted"
        field :session_id, -> { String }, optional: false, nullable: false, api_name: "sessionId"
        field :is_warm_instance, lambda {
          Internal::Types::Boolean
        }, optional: false, nullable: false, api_name: "isWarmInstance"
        field :aws_task_id, -> { String }, optional: true, nullable: false, api_name: "awsTaskId"
        field :language, -> { Seed::Commons::Types::Language }, optional: false, nullable: false
        field :status, -> { Seed::Submission::Types::ExecutionSessionStatus }, optional: false, nullable: false
      end
    end
  end
end
