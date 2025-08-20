# frozen_string_literal: true

module Seed
  module Service
    module Types
      class JustFileWithQueryParamsRequest < Internal::Types::Model
        field :maybe_string, -> { String }, optional: true, nullable: false
        field :integer, -> { Integer }, optional: false, nullable: false
        field :maybe_integer, -> { Integer }, optional: true, nullable: false
        field :list_of_strings, -> { String }, optional: false, nullable: false
        field :optional_list_of_strings, -> { String }, optional: true, nullable: false
<<<<<<< HEAD
=======

>>>>>>> 2bc1d6b267 (feat(ruby): support multipart file upload requests)
      end
    end
  end
end
