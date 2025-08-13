
module Seed
    module Types
        class InternalError < Internal::Types::Model
            field :exception_info, Seed::submission::ExceptionInfo, optional: false, nullable: false

    end
end
