# frozen_string_literal: true

module Seed
    module Types
        class WorkspaceRunDetails < Internal::Types::Model
            field :exception_v_2, Seed::Submission::ExceptionV2, optional: true, nullable: false
            field :exception, Seed::Submission::ExceptionInfo, optional: true, nullable: false
            field :stdout, String, optional: false, nullable: false

    end
end
