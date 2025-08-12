
module Seed
    module Types
        class GenericCreateProblemError < Internal::Types::Model
            field :message, , optional: false, nullable: false
            field :type, , optional: false, nullable: false
            field :stacktrace, , optional: false, nullable: false
        end
    end
end
