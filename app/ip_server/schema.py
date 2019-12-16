from marshmallow import Schema, fields

class AnnotationsSchema(Schema):
    label=fields.Str()
    age = fields.Integer()
    gender = fields.Str()
    expression = fields.Str()
    score=fields.Str()
    bbox=fields.Dict(keys=fields.Str(),values=fields.Int)


class ImagesSchema(Schema):
  _id = fields.Str(required=True)
  annotation = fields.List(fields.Nested(AnnotationsSchema))
  image_bytestream=fields.Field()
