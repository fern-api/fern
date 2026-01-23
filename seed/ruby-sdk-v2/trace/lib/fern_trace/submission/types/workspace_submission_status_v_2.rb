# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class WorkspaceSubmissionStatusV2 < Internal::Types::Model
        field :updates, -> { Internal::Types::Array[FernTrace::Submission::Types::WorkspaceSubmissionUpdate] }, optional: false, nullable: false
      end
    end
  end
end
