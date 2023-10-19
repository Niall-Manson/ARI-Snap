from flask import Flask, request

import base64
import numpy as np
import cv2

#non tf imports
import numpy as np
import cv2
from PIL import Image
import io

#tf and similar imports
import tensorflow as tf

app = Flask(__name__)

model = tf.keras.models.load_model("x16trashnet_imagenet_withbg_v3.3.2")

@app.post("/")
def create_store():
    def preprocessing(image):
        height = image.shape[0]
        width = image.shape[1]

        if height < width:
            image = image[:, round((width-height)/2):round((width-height)/2+height)]
        elif height > width:
            image = image[round((height-width)/2):round((height-width)/2+width), :]
        image = cv2.resize(image, (128, 128), interpolation=cv2.INTER_AREA)

        pixelValues = np.array([], dtype="float32")
        for h in range(128):
            for w in range(128):
                for c in range(3):
                    pixel = image[h][w][c]/255
                    pixelValues = np.append(pixelValues, [pixel])
        
        formattedImage = pixelValues.reshape(*(1, 128, 128, 3))

        return formattedImage
    
    def model_predict(model, image):
        prediction = model.predict(image)

        labels = ["cardboard", "glass", "metal", "paper", "plastic", "trash"]
        label = labels[np.argmax(prediction)]

        return label

    #obtaining base64 encoded image
    request_data = request.get_json()
    base64_string = request_data["base64Image"]

    imgdata = base64.b64decode(str(base64_string))
    img = Image.open(io.BytesIO(imgdata))
    image_array= cv2.cvtColor(np.array(img), cv2.COLOR_BGR2RGB)
    
    image = preprocessing(image_array)
    label = model_predict(model, image)

    print(label)

    return {"material": label}, 201

if __name__ == "__main__":
    app.run(debug=True)