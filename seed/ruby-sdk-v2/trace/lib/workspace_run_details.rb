# frozen_string_literal: true

module Submission
    module Types
        class WorkspaceRunDetails < Internal::Types::Model
            field :exception_v_2, Array, optional: true, nullable: true
            field :exception, Array, optional: true, nullable: true
            field :stdout, String, optional: true, nullable: true
        end
    end
end
