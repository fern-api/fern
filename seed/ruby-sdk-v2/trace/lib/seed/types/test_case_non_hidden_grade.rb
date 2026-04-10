# frozen_string_literal: true

module Seed
  module Types
    class TestCaseNonHiddenGrade < Internal::Types::Model
      field :passed, -> { Internal::Types::Boolean }, optional: false, nullable: false
      field :actual_result, -> { Seed::Types::VariableValue }, optional: true, nullable: false, api_name: "actualResult"
      field :exception, -> { Seed::Types::ExceptionV2 }, optional: true, nullable: false
      field :stdout, -> { String }, optional: false, nullable: false
    end
  end
end
