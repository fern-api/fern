# frozen_string_literal: true

module Seed
  module Types
    class SubmissionRequestTwo < Internal::Types::Model
      field :type, -> { Seed::Types::SubmissionRequestTwoType }, optional: false, nullable: false
    end
  end
end
