# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class InvalidRequestResponse < Internal::Types::Model
        field :request, -> { FernTrace::Submission::Types::SubmissionRequest }, optional: false, nullable: false
        field :cause, -> { FernTrace::Submission::Types::InvalidRequestCause }, optional: false, nullable: false
      end
    end
  end
end
