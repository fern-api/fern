# frozen_string_literal: true

module Seed
  module Admin
    module Types
      class AdminStoreTracedWorkspaceV2Request < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :body, -> { Internal::Types::Array[Seed::Types::TraceResponseV2] }, optional: false, nullable: false
      end
    end
  end
end
