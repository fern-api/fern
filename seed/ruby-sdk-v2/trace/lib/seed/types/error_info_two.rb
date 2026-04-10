# frozen_string_literal: true

module Seed
  module Types
    class ErrorInfoTwo < Internal::Types::Model
      field :type, -> { Seed::Types::ErrorInfoTwoType }, optional: false, nullable: false
    end
  end
end
