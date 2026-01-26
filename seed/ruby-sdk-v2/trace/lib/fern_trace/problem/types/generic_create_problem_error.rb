# frozen_string_literal: true

module FernTrace
  module Problem
    module Types
      class GenericCreateProblemError < Internal::Types::Model
        field :message, -> { String }, optional: false, nullable: false
        field :type, -> { String }, optional: false, nullable: false
        field :stacktrace, -> { String }, optional: false, nullable: false
      end
    end
  end
end
