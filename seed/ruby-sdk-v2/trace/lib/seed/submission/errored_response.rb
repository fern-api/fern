
module Seed
    module Types
        class ErroredResponse < Internal::Types::Model
            field :submission_id, , optional: false, nullable: false
            field :error_info, , optional: false, nullable: false
        end
    end
end
