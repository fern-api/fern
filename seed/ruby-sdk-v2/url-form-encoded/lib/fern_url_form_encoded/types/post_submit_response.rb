# frozen_string_literal: true

module FernUrlFormEncoded
  module Types
    class PostSubmitResponse < Internal::Types::Model
      field :status, -> { String }, optional: true, nullable: false
      field :message, -> { String }, optional: true, nullable: false
    end
  end
end
