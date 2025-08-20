# frozen_string_literal: true

module Seed
  module Service
    module Types
      class MyObject < Internal::Types::Model
        field :foo, -> { String }, optional: false, nullable: false
<<<<<<< HEAD
=======

>>>>>>> 2bc1d6b267 (feat(ruby): support multipart file upload requests)
      end
    end
  end
end
