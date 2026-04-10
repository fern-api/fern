# frozen_string_literal: true

module Seed
  module Types
    class WorkspaceSubmissionUpdateInfoType < Internal::Types::Model
      field :type, -> { Seed::Types::WorkspaceSubmissionUpdateInfoTypeType }, optional: false, nullable: false
    end
  end
end
