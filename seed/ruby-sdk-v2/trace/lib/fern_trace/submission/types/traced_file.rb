# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class TracedFile < Internal::Types::Model
        field :filename, -> { String }, optional: false, nullable: false
        field :directory, -> { String }, optional: false, nullable: false
      end
    end
  end
end
