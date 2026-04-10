# frozen_string_literal: true

module Seed
  module Types
    class WorkspaceSubmissionUpdateInfoTwo < Internal::Types::Model
      field :type, -> { Seed::Types::WorkspaceSubmissionUpdateInfoTwoType }, optional: false, nullable: false
    end
  end
end
