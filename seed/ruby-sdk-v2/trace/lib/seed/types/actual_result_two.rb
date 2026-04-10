# frozen_string_literal: true

module Seed
  module Types
    class ActualResultTwo < Internal::Types::Model
      field :type, -> { Seed::Types::ActualResultTwoType }, optional: false, nullable: false
      field :value, -> { Seed::Types::ExceptionV2 }, optional: true, nullable: false
    end
  end
end
