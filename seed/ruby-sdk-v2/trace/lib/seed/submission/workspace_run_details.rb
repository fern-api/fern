
module Seed
    module Types
        class WorkspaceRunDetails < Internal::Types::Model
            field :exception_v_2, , optional: true, nullable: false
            field :exception, , optional: true, nullable: false
            field :stdout, , optional: false, nullable: false
        end
    end
end
