# frozen_string_literal: true

module Seed
  module Types
    class WorkspaceRunDetails < Internal::Types::Model
      field :exception_v2, -> { Seed::Types::ExceptionV2 }, optional: true, nullable: false, api_name: "exceptionV2"
      field :exception, -> { Seed::Types::ExceptionInfo }, optional: true, nullable: false
      field :stdout, -> { String }, optional: false, nullable: false
    end
  end
end
