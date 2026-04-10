# frozen_string_literal: true

module Seed
  module Types
    class WorkspaceSubmissionStatusFour < Internal::Types::Model
      field :type, -> { Seed::Types::WorkspaceSubmissionStatusFourType }, optional: false, nullable: false
    end
  end
end
