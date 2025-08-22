# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class WorkspaceSubmissionStatusV2 < Internal::Types::Model
        field :updates, lambda {
          Internal::Types::Array[Seed::Submission::Types::WorkspaceSubmissionUpdate]
        }, optional: false, nullable: false
      end
    end
  end
end
