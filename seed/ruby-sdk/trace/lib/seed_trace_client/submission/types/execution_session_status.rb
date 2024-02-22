# frozen_string_literal: true

module SeedTraceClient
  class Submission
    class ExecutionSessionStatus
      CREATING_CONTAINER = "CREATING_CONTAINER"
      PROVISIONING_CONTAINER = "PROVISIONING_CONTAINER"
      PENDING_CONTAINER = "PENDING_CONTAINER"
      RUNNING_CONTAINER = "RUNNING_CONTAINER"
      LIVE_CONTAINER = "LIVE_CONTAINER"
      FAILED_TO_LAUNCH = "FAILED_TO_LAUNCH"
    end
  end
end
