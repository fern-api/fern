
module Seed
    module Types
        class InternalError < Internal::Types::Model
            field :exception_info, , optional: false, nullable: false
        end
    end
end
