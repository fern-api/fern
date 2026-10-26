# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Submission
    module Types
      class FinishedResponse < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
      end
    end
  end
end
