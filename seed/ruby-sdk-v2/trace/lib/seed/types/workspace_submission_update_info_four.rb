# frozen_string_literal: true

module Seed
  module Types
    class WorkspaceSubmissionUpdateInfoFour < Internal::Types::Model
      field :type, -> { Seed::Types::WorkspaceSubmissionUpdateInfoFourType }, optional: false, nullable: false
    end
  end
end
