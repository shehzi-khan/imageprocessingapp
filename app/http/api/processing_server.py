from flask import Flask, Response, send_from_directory,request,redirect, url_for
from flask_cors import CORS,cross_origin
import cv2, numpy as np,json
from AGE_recognition.AGE_recognition import predict
from app.ip_server.service import Service as DataServer

app = Flask(__name__)
cors = CORS(app, cross_origin=True,resources={r"http://0.0.0.0:5000/*": {"origins": "*"}})

@app.route('/annotations', methods=['POST'])
def annotate():
    if request.method == 'POST':
        # nparr = np.fromstring(request.data,np.uint8)
        # img=cv2.imdecode(nparr,cv2.IMREAD_COLOR)
        # result = detect_face(img)
        _id = request.args.get('id')
        image = DataServer().find_image_data(_id)
        bin_image = image["image_bytestream"]
        buff = np.frombuffer(bin_image, np.uint8)
        img = cv2.imdecode(buff, cv2.IMREAD_COLOR)
        image["annotation"] = predict(img, image["annotation"])
        DataServer().update_image_data(_id, {"annotation": image["annotation"]})
        response_pickled=json.dumps(image["annotation"])
        return Response(response=response_pickled,mimetype="application/json",headers={"Access-Control-Allow-Origin": "*"})


app.run(host='0.0.0.0', port=5050)