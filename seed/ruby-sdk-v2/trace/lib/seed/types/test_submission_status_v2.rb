# frozen_string_literal: true

module Seed
  module Types
    class TestSubmissionStatusV2 < Internal::Types::Model
      field :updates, -> { Internal::Types::Array[Seed::Types::TestSubmissionUpdate] }, optional: false, nullable: false
      field :problem_id, -> { String }, optional: false, nullable: false, api_name: "problemId"
      field :problem_version, -> { Integer }, optional: false, nullable: false, api_name: "problemVersion"
      field :problem_info, -> { Seed::Types::V2ProblemInfoV2 }, optional: false, nullable: false, api_name: "problemInfo"
    end
  end
end
