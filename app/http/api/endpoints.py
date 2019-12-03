from flask import Flask, json, g, request, Response
from app.ip_server.service import Service as DataServer
from app.ip_server.schema import ImagesSchema
from flask_cors import CORS
import cv2, numpy as np

app = Flask( __name__ )
CORS(app)

from pymongo import MongoClient
from bson.objectid import ObjectId
url = "223.195.37.85"
port=27017
client=MongoClient(url,port)
db = client["machine-learning"]
COLLECTION_NAME = 'ml-collection'

@app.route("/images", methods=["GET"])
def index():
 return json_response(DataServer().find_all_data())

@app.route("/images", methods=["POST"])
def create():
   images_repo = ImagesSchema().load(json.loads(request.data))

   if images_repo.errors:
     return json_response({'error': images_repo.errors}, 422)

   images = DataServer().save_image_data(images_repo)
   return json_response(images)

@app.route("/image/<string:_id>", methods=["GET"])
def show(_id):
 show_bbox=request.args.get('show-bbox')
 show_label=request.args.get('show-name')
 # show_score=request.args.get('show-score')
 hide_faces=request.args.get('hide-face')
 image = DataServer().find_image_data(_id)
 bin_image=image["image_bytestream"]

 buff = np.frombuffer(bin_image, np.uint8)
 img=cv2.imdecode(buff,cv2.IMREAD_COLOR)
 for index,face in enumerate(image["annotation"]):
     if str(index) not in hide_faces:
         label=face["label"]
         bbox=face["bbox"]
         print(type(show_label))
         if show_label == "True":
            cv2.putText(img, label, (bbox["x"]+10, bbox["y"]+bbox["h"]-20), cv2.FONT_HERSHEY_COMPLEX_SMALL, 1, (0,255,0), 2)
         if show_bbox == "True":
            cv2.rectangle(img, (bbox["x"], bbox["y"]), (bbox["x"]+bbox["w"], bbox["y"]+bbox["h"]), (255,0,0), thickness=2, lineType=8, shift=0)
 ret, jpeg = cv2.imencode('.jpg', img)
 image["image_bytestream"] = jpeg.tobytes()

 if image:
   img_data = (b'--frame\r\n'b'Content-Type: image/jpeg\r\n\r\n' + image["image_bytestream"] + b'\r\n\r\n')
   return Response(img_data, mimetype='multipart/x-mixed-replace; boundary=frame')
   # return json_response(image)
 else:
   return json_response({'error': 'Image data not found'}, 404)

@app.route("/image/annotations/<string:_id>", methods=["GET"])
def annotations(_id):
     image = DataServer().find_image_data(_id)
     if image:
         image.pop("image_bytestream")
         return json_response(image)
     else:
         return json_response({'error': 'Image data not found'}, 404)

@app.route("/image/<string:_id>", methods=["PUT"])
def update(_id):
   images_repo = ImagesSchema().load(json.loads(request.data))

   if images_repo.errors:
     return json_response({'error': images_repo.errors}, 422)

   images_service = DataServer()
   if images_service.update_image_data(_id, images_repo):
     print(images_repo.data)

     return json_response(images_repo.data)
   else:
     return json_response({'error': 'Image data not found'}, 404)


@app.route("/image/<string:_id>", methods=["DELETE"])
def delete(_id):
 images_service = DataServer()
 if images_service.delete_image_data(_id):
   return json_response({})
 else:
   return json_response({'error': 'Image not found'}, 404)

def json_response(payload, status=200):
 return (json.dumps(payload), status, {'content-type': 'application/json'})

app.run(host='0.0.0.0')