# frozen_string_literal: true

module Types
    module Types
        class Movie < Internal::Types::Model
            field :id, MovieId, optional: true, nullable: true
            field :prequel, Array, optional: true, nullable: true
            field :title, String, optional: true, nullable: true
            field :from, String, optional: true, nullable: true
            field :rating, Float, optional: true, nullable: true
            field :type, Array, optional: true, nullable: true
            field :tag, Tag, optional: true, nullable: true
            field :book, Array, optional: true, nullable: true
            field :metadata, Array, optional: true, nullable: true
            field :revenue, Long, optional: true, nullable: true
        end
    end
end
