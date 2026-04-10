# frozen_string_literal: true

module Seed
  module Types
    class WorkspaceSubmissionUpdateInfoThree < Internal::Types::Model
      field :type, -> { Seed::Types::WorkspaceSubmissionUpdateInfoThreeType }, optional: false, nullable: false
    end
  end
end
