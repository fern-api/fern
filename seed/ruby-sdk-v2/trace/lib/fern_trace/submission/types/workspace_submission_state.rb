# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class WorkspaceSubmissionState < Internal::Types::Model
        field :status, -> { FernTrace::Submission::Types::WorkspaceSubmissionStatus }, optional: false, nullable: false
      end
    end
  end
end
