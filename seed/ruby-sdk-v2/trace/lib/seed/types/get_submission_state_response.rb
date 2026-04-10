# frozen_string_literal: true

module Seed
  module Types
    class GetSubmissionStateResponse < Internal::Types::Model
      field :time_submitted, -> { String }, optional: true, nullable: false, api_name: "timeSubmitted"
      field :submission, -> { String }, optional: false, nullable: false
      field :language, -> { Seed::Types::Language }, optional: false, nullable: false
      field :submission_type_state, -> { Seed::Types::SubmissionTypeState }, optional: false, nullable: false, api_name: "submissionTypeState"
    end
  end
end
