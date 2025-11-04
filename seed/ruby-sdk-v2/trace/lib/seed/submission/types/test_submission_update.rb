# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class TestSubmissionUpdate < Internal::Types::Model
        field :update_time, -> { String }, optional: false, nullable: false, api_name: "updateTime"
        field :update_info, lambda {
          Seed::Submission::Types::TestSubmissionUpdateInfo
        }, optional: false, nullable: false, api_name: "updateInfo"
      end
    end
  end
end
