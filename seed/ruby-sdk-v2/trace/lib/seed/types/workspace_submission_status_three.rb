# frozen_string_literal: true

module Seed
  module Types
    class WorkspaceSubmissionStatusThree < Internal::Types::Model
      field :type, -> { Seed::Types::WorkspaceSubmissionStatusThreeType }, optional: false, nullable: false
    end
  end
end
