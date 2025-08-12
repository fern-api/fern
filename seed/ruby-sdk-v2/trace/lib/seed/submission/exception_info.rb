
module Seed
    module Types
        class ExceptionInfo < Internal::Types::Model
            field :exception_type, , optional: false, nullable: false
            field :exception_message, , optional: false, nullable: false
            field :exception_stacktrace, , optional: false, nullable: false
        end
    end
end
