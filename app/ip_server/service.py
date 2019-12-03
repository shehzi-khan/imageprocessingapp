from ..repository.mongo import MongoRepository
from .schema import ImagesSchema
from bson.objectid import ObjectId

class Service(object):
 def __init__ (self, repo_client=MongoRepository()):
   self.repo_client = repo_client

 def find_all_data(self,limit=None,sort=-1):
   images = self.repo_client.find_all(limit,sort)
   return [self.dump(image) for image in images]

 def find_image_data(self, image_id):
   image = self.repo_client.find({'_id': ObjectId(image_id)})
   return self.dump(image)

 def save_image_data(self, DataRepo):
   self.repo_client.create(DataRepo)
   return self.dump(DataRepo.data)

 def update_image_data(self, image_id, DataRepo):
   records_affected = self.repo_client.update({'_id': ObjectId(image_id)}, DataRepo)
   return records_affected > 0

 def delete_image_data(self, image_id):
   records_affected = self.repo_client.delete({'_id': ObjectId(image_id)})
   return records_affected > 0

 def dump(self, data):
   return ImagesSchema().dump(data)
