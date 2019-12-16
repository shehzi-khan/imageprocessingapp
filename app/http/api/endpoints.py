from flask import Flask, json, g, request, Response
from app.ip_server.service import Service as DataServer
from app.ip_server.schema import ImagesSchema
from flask_cors import CORS,cross_origin
import cv2, numpy as np,requests

# from AGE_recognition.AGE_recognition import predict
app = Flask( __name__ )
CORS(app,cross_origin=True,resources={r"http://0.0.0.0:5000/*": {"origins": "*"}})


@app.route("/images", methods=["GET"])
@cross_origin()
def index():
 filter = request.args.get('filter')
 return json_response(DataServer().find_all_data(filter=filter))

@app.route("/images", methods=["POST"])
@cross_origin()
def create():
   images_repo = ImagesSchema().load(json.loads(request.data))

   if images_repo.errors:
     return json_response({'error': images_repo.errors}, 422)

   images = DataServer().save_image_data(images_repo)
   return json_response(images)

@app.route("/image/<string:_id>", methods=["GET"])
@cross_origin()
def show(_id):
 show_bbox=request.args.get('show-bbox')
 show_label=request.args.get('show-label')
 show_score=request.args.get('show-score')
 show_expression=request.args.get('show-expression')
 show_age=request.args.get('show-age')
 show_gender=request.args.get('show-gender')
 hide_faces=request.args.get('hide-face')
 image = DataServer().find_image_data(_id)
 bin_image=image["image_bytestream"]

 buff = np.frombuffer(bin_image, np.uint8)
 img=cv2.imdecode(buff,cv2.IMREAD_COLOR)

 # image = DataServer().find_image_data(_id)
 # if "expression" not in image["annotation"][0].keys():
 #     respose = requests.post("http://0.0.0.0:5050/annotations?id=" + _id, headers={'content-type': 'image/jpeg'})
 #     image["annotation"] = json.loads(respose.text)
 # print("Faces: ",len(image["annotation"]))
 for index,face in enumerate(image["annotation"]):
     if str(index) in hide_faces:
         label=face["label"]
         bbox=face["bbox"]

         if show_gender == "true":
             if "gender" in face.keys():
                # print("gender",face["gender"])
                label = label + " , " + face["gender"]
         if show_age == "true":
             if "age" in face.keys():
                label = label + " , " + str(face["age"])
         if show_expression == "true":
             if "expression" in face.keys():
                label = label + " , " + face["expression"]
         if show_score == "true":
             if "score" in face.keys():
                 label = label +" , "+face["score"]+"%"

         if show_label == "true":
            cv2.putText(img, label, (bbox["x"]+10, bbox["y"]+bbox["h"]-20), cv2.FONT_HERSHEY_PLAIN, 1, (0,255,0), 2)
         if show_bbox == "true":
            cv2.rectangle(img, (bbox["x"], bbox["y"]), (bbox["x"]+bbox["w"], bbox["y"]+bbox["h"]), (255,0,0), thickness=2, lineType=8, shift=0)

 ret, jpeg = cv2.imencode('.jpg', img)
 image["image_bytestream"] = jpeg.tobytes()

 if image:
   img_data = (b'--frame\r\n'b'Content-Type: image/jpeg\r\n\r\n' + image["image_bytestream"] + b'\r\n\r\n')
   return Response(img_data, mimetype='multipart/x-mixed-replace; boundary=frame')

 else:
   return json_response({'error': 'Image data not found'}, 404)

@app.route("/thumb/<string:_id>", methods=["GET"])
@cross_origin()
def thumb(_id):
 image = DataServer().find_image_data(_id)
 bin_image=image["image_bytestream"]

 buff = np.frombuffer(bin_image, np.uint8)
 img=cv2.imdecode(buff,cv2.IMREAD_COLOR)
 img = cv2.resize(img,(100,100))
 ret, jpeg = cv2.imencode('.jpg', img)
 image["image_bytestream"] = jpeg.tobytes()

 if image:
   img_data = (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n'
               b'Content-Length: '+str(len(img)).encode()+b'\r\n'
               b'\r\n' + image["image_bytestream"] + b'\r\n\r\n')
   import time
   time.sleep(0.01)
   return Response(img_data, mimetype='multipart/x-mixed-replace; boundary=frame')
   # return json_response(image)
 else:
   return json_response({'error': 'Image data not found'}, 404)

@app.route("/image/annotations/<string:_id>", methods=["GET"])
@cross_origin()
def annotations(_id):
     image = DataServer().find_image_data(_id)
     # if "expression" not in image["annotation"][0].keys():
     #    respose = requests.post("http://0.0.0.0:5050/annotations?id="+_id,headers={'content-type': 'image/jpeg'})
     #    image["annotation"] = json.loads(respose.text)
     if image:
         image.pop("image_bytestream")
         return json_response(image)
     else:
         return json_response({'error': 'Image data not found'}, 404)

@app.route("/image/<string:_id>", methods=["PUT"])
@cross_origin()
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
@cross_origin()
def delete(_id):
 images_service = DataServer()
 if images_service.delete_image_data(_id):
   return json_response({})
 else:
   return json_response({'error': 'Image not found'}, 404)

def json_response(payload, status=200):
 return (json.dumps(payload), status, {'content-type': 'application/json'})

app.run(host='0.0.0.0',threaded=False)