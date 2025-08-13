
module Seed
    module Types
        class WorkspaceRunDetails < Internal::Types::Model
            field :exception_v_2, Seed::submission::ExceptionV2, optional: true, nullable: false
            field :exception, Seed::submission::ExceptionInfo, optional: true, nullable: false
            field :stdout, String, optional: false, nullable: false

    end
end
