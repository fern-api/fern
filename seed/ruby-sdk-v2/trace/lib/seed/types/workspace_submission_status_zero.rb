# frozen_string_literal: true

module Seed
  module Types
    class WorkspaceSubmissionStatusZero < Internal::Types::Model
      field :type, -> { Seed::Types::WorkspaceSubmissionStatusZeroType }, optional: false, nullable: false
    end
  end
end
