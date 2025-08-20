# frozen_string_literal: true

module Seed
  module Service
    module Types
      class MyObjectWithOptional < Internal::Types::Model
        field :prop, -> { String }, optional: false, nullable: false
        field :optional_prop, -> { String }, optional: true, nullable: false
<<<<<<< HEAD
=======

>>>>>>> 2bc1d6b267 (feat(ruby): support multipart file upload requests)
      end
    end
  end
end
