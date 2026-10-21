# frozen_string_literal: true

require_relative "../.."

module Seed
  module Submission
    module Types
      class WorkspaceSubmissionStatusV2 < Internal::Types::Model
        field :updates, -> { Internal::Types::Array[Seed::Submission::Types::WorkspaceSubmissionUpdate] }, optional: false, nullable: false
      end
    end
  end
end
