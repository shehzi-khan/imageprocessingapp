import os
from pymongo import MongoClient


# COLLECTION_NAME = 'ml-collection'

class MongoRepository():
 def __init__ (self):
   self.url = "223.195.37.85"
   self.port=27017
   self.client=MongoClient(self.url,self.port)
   self.db = self.client["machine-learning"]
   self.COLLECTION_NAME = 'ml-collection'

 def find_all(self,limit=None,sort=-1):
   if limit is not None:
       return self.db[self.COLLECTION_NAME].find().limit(limit).sort("_id", sort)
   else:
       return self.db[self.COLLECTION_NAME].find().sort("_id",sort)

 def find(self, selector):
   return self.db[self.COLLECTION_NAME].find_one(selector)

 def create(self, kudo):
   return self.db[self.COLLECTION_NAME].insert_one(kudo)

 def update(self, selector, kudo):
   return self.db[self.COLLECTION_NAME].replace_one(selector, kudo).modified_count

 def delete(self, selector):
   return self.db[self.COLLECTION_NAME].delete_one(selector).deleted_count
