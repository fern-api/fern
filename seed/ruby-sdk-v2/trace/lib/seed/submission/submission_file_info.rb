
module Seed
    module Types
        class SubmissionFileInfo < Internal::Types::Model
            field :directory, , optional: false, nullable: false
            field :filename, , optional: false, nullable: false
            field :contents, , optional: false, nullable: false
        end
    end
end
