# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class ErroredResponse < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :error_info, -> { FernTrace::Submission::Types::ErrorInfo }, optional: false, nullable: false, api_name: "errorInfo"
      end
    end
  end
end
