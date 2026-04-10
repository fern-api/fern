# frozen_string_literal: true

module Seed
  module Types
    class InternalError < Internal::Types::Model
      field :exception_info, -> { Seed::Types::ExceptionInfo }, optional: false, nullable: false, api_name: "exceptionInfo"
    end
  end
end
