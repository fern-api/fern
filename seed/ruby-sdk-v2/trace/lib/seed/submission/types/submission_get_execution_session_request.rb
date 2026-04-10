# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class SubmissionGetExecutionSessionRequest < Internal::Types::Model
        field :session_id, -> { String }, optional: false, nullable: false, api_name: "sessionId"
      end
    end
  end
end
