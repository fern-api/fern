# frozen_string_literal: true

module Seed
  module Types
    class SubmissionResponseTwo < Internal::Types::Model
      field :type, -> { Seed::Types::SubmissionResponseTwoType }, optional: false, nullable: false
    end
  end
end
