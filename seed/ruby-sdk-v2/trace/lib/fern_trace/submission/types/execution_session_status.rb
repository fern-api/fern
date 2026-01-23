# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      module ExecutionSessionStatus
        extend FernTrace::Internal::Types::Enum

        CREATING_CONTAINER = "CREATING_CONTAINER"
        PROVISIONING_CONTAINER = "PROVISIONING_CONTAINER"
        PENDING_CONTAINER = "PENDING_CONTAINER"
        RUNNING_CONTAINER = "RUNNING_CONTAINER"
        LIVE_CONTAINER = "LIVE_CONTAINER"
        FAILED_TO_LAUNCH = "FAILED_TO_LAUNCH"
      end
    end
  end
end
