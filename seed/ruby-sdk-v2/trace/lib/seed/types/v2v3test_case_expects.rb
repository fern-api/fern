# frozen_string_literal: true

module Seed
  module Types
    class V2V3TestCaseExpects < Internal::Types::Model
      field :expected_stdout, -> { String }, optional: true, nullable: false, api_name: "expectedStdout"
    end
  end
end
