
module Seed
    module Types
        module MigrationStatus
            extends Seed::Internal::Types::Enum
            RUNNING = "RUNNING"
            FAILED = "FAILED"
            FINISHED = "FINISHED"end
    end
end
