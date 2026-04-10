# frozen_string_literal: true

module Seed
  module Types
    class CreateProblemError < Internal::Types::Model
      field :type, -> { Seed::Types::CreateProblemErrorType }, optional: false, nullable: false, api_name: "_type"
    end
  end
end
