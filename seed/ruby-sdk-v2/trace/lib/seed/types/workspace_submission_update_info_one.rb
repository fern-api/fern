# frozen_string_literal: true

module Seed
  module Types
    class WorkspaceSubmissionUpdateInfoOne < Internal::Types::Model
      field :type, -> { Seed::Types::WorkspaceSubmissionUpdateInfoOneType }, optional: false, nullable: false
    end
  end
end
