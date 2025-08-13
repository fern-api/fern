
module Seed
    module Types
        class ExceptionInfo < Internal::Types::Model
            field :exception_type, String, optional: false, nullable: false
            field :exception_message, String, optional: false, nullable: false
            field :exception_stacktrace, String, optional: false, nullable: false
        end
    end
end
