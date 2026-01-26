# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class WorkspaceRunDetails < Internal::Types::Model
        field :exception_v_2, -> { FernTrace::Submission::Types::ExceptionV2 }, optional: true, nullable: false, api_name: "exceptionV2"
        field :exception, -> { FernTrace::Submission::Types::ExceptionInfo }, optional: true, nullable: false
        field :stdout, -> { String }, optional: false, nullable: false
      end
    end
  end
end
