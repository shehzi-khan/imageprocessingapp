from AGE_recognition.AGE_recognition import predict

img=cv2.imread("image.jpg,cv2.IMREAD_COLOR)
annotation=[{"label":"Dat","bbox":{"y":165,"w":152,"h":193,"x":372}}]
ann=predict(img,annotation)
print(ann)
# Output: [{"label":"Dat","bbox":{"y":165,"w":152,"h":193,"x":372},"expression":"neutral","gender":"M","age":21}]

