# frozen_string_literal: true

module Seed
  module Service
    module Types
      class MyInlineType < Internal::Types::Model
        field :bar, -> { String }, optional: false, nullable: false
<<<<<<< HEAD
=======

>>>>>>> 2bc1d6b267 (feat(ruby): support multipart file upload requests)
      end
    end
  end
end
