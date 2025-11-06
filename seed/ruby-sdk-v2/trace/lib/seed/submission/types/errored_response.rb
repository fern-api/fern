# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class ErroredResponse < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :error_info, lambda {
          Seed::Submission::Types::ErrorInfo
        }, optional: false, nullable: false, api_name: "errorInfo"
      end
    end
  end
end
