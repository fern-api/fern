# frozen_string_literal: true

module Seed
  module Types
    class ExceptionType < Internal::Types::Model
      field :type, -> { Seed::Types::ExceptionTypeType }, optional: false, nullable: false
    end
  end
end
