# frozen_string_literal: true

require_relative "../.."

module Seed
  module Submission
    module Types
      class InvalidRequestResponse < Internal::Types::Model
        field :request, -> { Seed::Submission::Types::SubmissionRequest }, optional: false, nullable: false

        field :cause, -> { Seed::Submission::Types::InvalidRequestCause }, optional: false, nullable: false
      end
    end
  end
end
