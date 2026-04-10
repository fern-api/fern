# frozen_string_literal: true

module Seed
  module Types
    class SubmissionResponseFive < Internal::Types::Model
      field :type, -> { Seed::Types::SubmissionResponseFiveType }, optional: false, nullable: false
    end
  end
end
